import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Transcript from "@/lib/models/Transcript"
import Ticket from "@/lib/models/Ticket"
import { parseBody } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

/**
 * POST /api/guilds/[guildId]/tickets/[ticketId]/transcript
 * Save transcript HTML for a ticket
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ guildId: string; ticketId: string }> }
) {
    const { guildId, ticketId } = await params

    // Verify bot token
    const authHeader = request.headers.get("authorization")
    const botToken = process.env.BOT_TOKEN

    if (!authHeader || !botToken || authHeader !== `Bearer ${botToken}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

        if (!html || !channelId || !generatedBy) {
            return NextResponse.json(
                { error: "html, channelId, and generatedBy are required" },
                { status: 400 }
            )
        }

        await connectToDatabase()

        // Verify ticket exists
        const ticket = await Ticket.findByTicketId(ticketId)
        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
        }

        if (ticket.guildId !== guildId) {
            return NextResponse.json({ error: "Ticket does not belong to this guild" }, { status: 400 })
        }

        // Generate transcript ID
        const transcriptId = Transcript.generateTranscriptId()

        // Create transcript
        const transcript = new Transcript({
            transcriptId,
            guildId,
            ticketId,
            channelId,
            html,
            messageCount: messageCount || 0,
            generatedBy
        })

        await transcript.save()

        // Update ticket with transcript URL
        const transcriptUrl = `${process.env.NEXTAUTH_URL}/transcript/${transcriptId}`
        ticket.transcriptURL = transcriptUrl
        await ticket.save()

        return NextResponse.json(
            {
                success: true,
                transcriptId,
                transcriptUrl
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Error saving transcript:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

/**
 * GET /api/guilds/[guildId]/tickets/[ticketId]/transcript
 * Get transcript for a ticket
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ guildId: string; ticketId: string }> }
) {
    const { guildId, ticketId } = await params

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
