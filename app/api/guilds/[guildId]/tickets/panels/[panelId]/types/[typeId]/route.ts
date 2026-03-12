import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import TicketPanel from "@/lib/models/TicketPanel"

export const dynamic = "force-dynamic"

/**
 * DELETE /api/guilds/[guildId]/tickets/panels/[panelId]/types/[typeId]
 * Remove a ticket type from a panel
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ guildId: string; panelId: string; typeId: string }> }
) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId, panelId, typeId } = await params

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

        const type = panel.getTicketType(typeId)
        if (!type) {
            return NextResponse.json({ error: "Type not found" }, { status: 404 })
        }

        await panel.removeTicketType(typeId)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error removing ticket type:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
