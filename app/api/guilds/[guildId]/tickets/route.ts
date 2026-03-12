import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import Ticket from "@/lib/models/Ticket"
import TicketPanel from "@/lib/models/TicketPanel"

export const dynamic = "force-dynamic"

/**
 * GET /api/guilds/[guildId]/tickets
 * Fetch all tickets for a guild with filtering options
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

        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status") as 'open' | 'closed' | 'locked' | null
        const panelId = searchParams.get("panelId")

        let tickets

        if (status) {
            tickets = await Ticket.getTicketsByStatus(guildId, status)
        } else if (panelId) {
            tickets = await Ticket.getGuildTicketsByPanel(guildId, panelId)
        } else {
            tickets = await Ticket.getGuildTickets(guildId)
        }

        // Get panel information for each ticket
        const panelIds = [...new Set(tickets.map(t => t.panelId))]
        const panels = await TicketPanel.find({ panelId: { $in: panelIds } }).lean()
        const panelMap = new Map(panels.map(p => [p.panelId, p]))

        // Enrich tickets with panel and type info
        const enrichedTickets = tickets.map(ticket => {
            const panel = panelMap.get(ticket.panelId)
            const type = panel?.ticketTypes.find(t => t.typeId === ticket.typeId)
            
            return {
                ticketId: ticket.ticketId,
                panelTitle: panel?.title || 'Unknown Panel',
                typeLabel: type?.label || 'Unknown Type',
                channelId: ticket.channelId,
                userId: ticket.userId,
                claimedBy: ticket.claimedBy,
                status: ticket.status,
                priority: ticket.priority,
                reason: ticket.reason,
                closeReason: ticket.closeReason,
                addedUsers: ticket.addedUsers,
                messageCount: ticket.messageCount,
                createdAt: ticket.createdAt,
                closedAt: ticket.closedAt,
                closedBy: ticket.closedBy,
                lastActivityAt: ticket.lastActivityAt
            }
        })

        // Calculate statistics
        const stats = {
            total: tickets.length,
            open: tickets.filter(t => t.status === 'open').length,
            closed: tickets.filter(t => t.status === 'closed').length,
            locked: tickets.filter(t => t.status === 'locked').length,
            claimed: tickets.filter(t => t.claimedBy).length,
            priority: {
                low: tickets.filter(t => t.priority === 'low').length,
                medium: tickets.filter(t => t.priority === 'medium').length,
                high: tickets.filter(t => t.priority === 'high').length,
                urgent: tickets.filter(t => t.priority === 'urgent').length
            }
        }

        return NextResponse.json({
            tickets: enrichedTickets,
            stats
        })
    } catch (error) {
        console.error("Error fetching tickets:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
