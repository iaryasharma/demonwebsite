import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import TicketPanel from "@/lib/models/TicketPanel"
import { parseBody, pickAllowed, hasMongoOperators } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

/**
 * GET /api/guilds/[guildId]/tickets/panels
 * Fetch all ticket panels for a guild
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ guildId: string }> }
) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId } = await params

    if (!validateGuildId(guildId)) {
        return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 })
    }

    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        await connectToDatabase()

        const panels = await TicketPanel.getGuildPanels(guildId)

        return NextResponse.json({ panels })
    } catch (error) {
        console.error("Error fetching ticket panels:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

/**
 * POST /api/guilds/[guildId]/tickets/panels
 * Create a new ticket panel
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ guildId: string }> }
) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId } = await params

    if (!validateGuildId(guildId)) {
        return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 })
    }

    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const parsed = await parseBody(request)
        if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status })

        const { channelId, title, description } = parsed.data as {
            channelId: string
            title: string
            description?: string
        }

        // Validation
        if (!channelId || !title) {
            return NextResponse.json(
                { error: "channelId and title are required" },
                { status: 400 }
            )
        }

        if (!validateGuildId(channelId)) {
            return NextResponse.json({ error: "Invalid channel ID" }, { status: 400 })
        }

        if (title.length > 256) {
            return NextResponse.json(
                { error: "Title must be 256 characters or less" },
                { status: 400 }
            )
        }

        if (description && description.length > 4000) {
            return NextResponse.json(
                { error: "Description must be 4000 characters or less" },
                { status: 400 }
            )
        }

        await connectToDatabase()

        // Generate panel ID
        const panelId = TicketPanel.generatePanelId()

        // Create panel
        const panel = new TicketPanel({
            guildId,
            panelId,
            channelId,
            title,
            description: description || 'Select a ticket type below to get started.',
            ticketTypes: [],
            enabled: true
        })

        await panel.save()

        return NextResponse.json({
            success: true,
            panel: {
                panelId: panel.panelId,
                channelId: panel.channelId,
                title: panel.title,
                description: panel.description,
                ticketTypes: panel.ticketTypes,
                enabled: panel.enabled,
                createdAt: panel.createdAt
            }
        })
    } catch (error) {
        console.error("Error creating ticket panel:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
