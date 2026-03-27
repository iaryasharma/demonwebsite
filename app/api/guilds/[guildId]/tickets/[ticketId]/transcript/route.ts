import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Transcript from "@/lib/models/Transcript"
import Ticket from "@/lib/models/Ticket"
import { parseBody } from "@/lib/api-helpers"
import { checkRateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

/**
 * POST /api/guilds/[guildId]/tickets/[ticketId]/transcript
 * Save transcript HTML for a ticket
 * 
 * Security:
 * - Verifies bot token (bearer token authentication)
 * - Validates guild/ticket ownership
 * - Input size limits and validation
 * - Rate limiting per guild
 * - HTML size validation to prevent abuse
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ guildId: string; ticketId: string }> }
) {
    const { guildId, ticketId } = await params

    // Security: Extract client IP for rate limiting
    const ip = 
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        "unknown"

    // Rate limiting check (guilds category: 60 req/min)
    const rateLimitResult = checkRateLimit(ip, "/api/guilds")
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: "Rate limit exceeded" },
            {
                status: 429,
                headers: {
                    "Retry-After": String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
                }
            }
        )
    }

    // Verify bot token authentication
    const authHeader = request.headers.get("authorization")
    const botToken = process.env.BOT_TOKEN

    if (!authHeader || !botToken) {
        console.warn(`Unauthorized transcript save attempt: IP=${ip}, Guild=${guildId}`)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (authHeader !== `Bearer ${botToken}`) {
        console.warn(`Invalid token attempt: IP=${ip}, Guild=${guildId}`)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Input validation: Check IDs format
    if (!guildId || !ticketId || typeof guildId !== "string" || typeof ticketId !== "string") {
        return NextResponse.json(
            { error: "Invalid guild or ticket ID" },
            { status: 400 }
        )
    }

    if (guildId.length > 50 || ticketId.length > 50) {
        return NextResponse.json(
            { error: "Invalid guild or ticket ID format" },
            { status: 400 }
        )
    }

    try {
        const parsed = await parseBody(request)
        if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status })

        const { html, channelId, messageCount, generatedBy } = parsed.data as {
            html: string
            channelId: string
            messageCount: number
            generatedBy: string
        }

        // Input validation
        if (!html || !channelId || !generatedBy) {
            return NextResponse.json(
                { error: "html, channelId, and generatedBy are required" },
                { status: 400 }
            )
        }

        // Security: Validate HTML size (max 5MB for transcript content)
        if (html.length > 5_242_880) {
            return NextResponse.json(
                { error: "Transcript HTML too large (max 5MB)" },
                { status: 413 }
            )
        }

        // Validate channelId and generatedBy format
        if (channelId.length > 50 || generatedBy.length > 50) {
            return NextResponse.json(
                { error: "Invalid channel ID or user ID format" },
                { status: 400 }
            )
        }

        // Validate messageCount
        if (typeof messageCount !== "number" || messageCount < 0 || messageCount > 100000) {
            return NextResponse.json(
                { error: "Invalid message count" },
                { status: 400 }
            )
        }

        await connectToDatabase()

        // Verify ticket exists and belongs to the guild
        const ticket = await Ticket.findByTicketId(ticketId)
        if (!ticket) {
            return NextResponse.json(
                { error: "Ticket not found" },
                { status: 404 }
            )
        }

        if (ticket.guildId !== guildId) {
            console.warn(`Cross-guild transcript attempt: Guild=${guildId}, Ticket=${ticketId}, ActualGuild=${ticket.guildId}`)
            return NextResponse.json(
                { error: "Ticket does not belong to this guild" },
                { status: 403 }
            )
        }

        // Generate transcript ID
        const transcriptId = Transcript.generateTranscriptId()

        // Create transcript with TTL auto-expiration
        const transcript = new Transcript({
            transcriptId,
            guildId,
            ticketId,
            channelId,
            html,
            messageCount: messageCount || 0,
            generatedBy,
            generatedAt: new Date() // Explicitly set for TTL calculation
        })

        await transcript.save()

        // Update ticket with transcript URL
        const transcriptUrl = `${process.env.NEXTAUTH_URL}/transcript/${transcriptId}`
        ticket.transcriptURL = transcriptUrl
        await ticket.save()

        // Log successful transcript creation
        console.log(`✅ Transcript created: ID=${transcriptId}, Guild=${guildId}, Ticket=${ticketId}`)

        return NextResponse.json(
            {
                success: true,
                transcriptId,
                transcriptUrl,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                message: "Transcript will be automatically deleted after 7 days"
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Error saving transcript:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

/**
 * GET /api/guilds/[guildId]/tickets/[ticketId]/transcript
 * Get transcript for a ticket (admin only)
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ guildId: string; ticketId: string }> }
) {
    const { guildId, ticketId } = await params

    // Extract client IP for rate limiting
    const ip = 
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        "unknown"

    // Rate limiting check
    const rateLimitResult = checkRateLimit(ip, "/api/guilds")
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: "Rate limit exceeded" },
            { status: 429 }
        )
    }

    try {
        await connectToDatabase()

        const transcript = await Transcript.findByTicketId(ticketId)

        if (!transcript) {
            return NextResponse.json({ error: "Transcript not found" }, { status: 404 })
        }

        if (transcript.guildId !== guildId) {
            return NextResponse.json({ error: "Transcript does not belong to this guild" }, { status: 403 })
        }

        return NextResponse.json({ transcript })
    } catch (error) {
        console.error("Error fetching transcript:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

/**
 * DELETE /api/guilds/[guildId]/tickets/[ticketId]/transcript
 * Delete transcript for a ticket (admin only, bot token required)
 * Allows manual deletion before the 7-day TTL expires
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ guildId: string; ticketId: string }> }
) {
    const { guildId, ticketId } = await params

    // Verify bot token authentication
    const authHeader = request.headers.get("authorization")
    const botToken = process.env.BOT_TOKEN

    if (!authHeader || !botToken || authHeader !== `Bearer ${botToken}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Input validation
    if (!guildId || !ticketId || typeof guildId !== "string" || typeof ticketId !== "string") {
        return NextResponse.json(
            { error: "Invalid guild or ticket ID" },
            { status: 400 }
        )
    }

    try {
        await connectToDatabase()

        // Find and verify transcript
        const transcript = await Transcript.findByTicketId(ticketId)

        if (!transcript) {
            return NextResponse.json(
                { error: "Transcript not found" },
                { status: 404 }
            )
        }

        if (transcript.guildId !== guildId) {
            return NextResponse.json(
                { error: "Transcript does not belong to this guild" },
                { status: 403 }
            )
        }

        // Delete transcript from database
        await Transcript.deleteOne({ transcriptId: transcript.transcriptId })

        // Update ticket to remove transcript URL
        const ticket = await Ticket.findByTicketId(ticketId)
        if (ticket) {
            ticket.transcriptURL = undefined
            await ticket.save()
        }

        console.log(`🗑️  Transcript deleted: ID=${transcript.transcriptId}, Guild=${guildId}, Ticket=${ticketId}`)

        return NextResponse.json(
            {
                success: true,
                message: "Transcript deleted successfully"
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error deleting transcript:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
