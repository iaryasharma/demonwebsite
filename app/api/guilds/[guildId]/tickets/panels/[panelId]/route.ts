import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import TicketPanel from "@/lib/models/TicketPanel"
import { parseBody } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

/**
 * GET /api/guilds/[guildId]/tickets/panels/[panelId]
 * Get a specific ticket panel
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ guildId: string; panelId: string }> }
) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId, panelId } = await params

    if (!validateGuildId(guildId)) {
        return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 })
    }

    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        await connectToDatabase()

        const panel = await TicketPanel.findByPanelId(guildId, panelId)

        if (!panel) {
            return NextResponse.json({ error: "Panel not found" }, { status: 404 })
        }

        return NextResponse.json({ panel })
    } catch (error) {
        console.error("Error fetching ticket panel:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

/**
 * PATCH /api/guilds/[guildId]/tickets/panels/[panelId]
 * Update a ticket panel
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ guildId: string; panelId: string }> }
) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId, panelId } = await params

    if (!validateGuildId(guildId)) {
        return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 })
    }

    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const parsed = await parseBody(request)
        if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status })

        await connectToDatabase()

        const panel = await TicketPanel.findByPanelId(guildId, panelId)

        if (!panel) {
            return NextResponse.json({ error: "Panel not found" }, { status: 404 })
        }

        const { title, description, enabled, channelId } = parsed.data as {
            title?: string
            description?: string
            enabled?: boolean
            channelId?: string
        }

        if (title !== undefined) {
            if (title.length > 256) {
                return NextResponse.json(
                    { error: "Title must be 256 characters or less" },
                    { status: 400 }
                )
            }
            panel.title = title
        }

        if (description !== undefined) {
            if (description.length > 4000) {
                return NextResponse.json(
                    { error: "Description must be 4000 characters or less" },
                    { status: 400 }
                )
            }
            panel.description = description
        }

        if (enabled !== undefined) {
            panel.enabled = enabled
        }

        if (channelId !== undefined) {
            if (!validateGuildId(channelId)) {
                return NextResponse.json({ error: "Invalid channel ID" }, { status: 400 })
            }
            panel.channelId = channelId
        }

        await panel.save()

        return NextResponse.json({ success: true, panel })
    } catch (error) {
        console.error("Error updating ticket panel:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

/**
 * DELETE /api/guilds/[guildId]/tickets/panels/[panelId]
 * Delete a ticket panel
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ guildId: string; panelId: string }> }
) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId, panelId } = await params

    if (!validateGuildId(guildId)) {
        return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 })
    }

    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        await connectToDatabase()

        const panel = await TicketPanel.findByPanelId(guildId, panelId)

        if (!panel) {
            return NextResponse.json({ error: "Panel not found" }, { status: 404 })
        }

        await TicketPanel.deleteOne({ panelId })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting ticket panel:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
