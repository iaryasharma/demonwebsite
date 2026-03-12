import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import TicketPanel from "@/lib/models/TicketPanel"
import { parseBody } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

/**
 * POST /api/guilds/[guildId]/tickets/panels/[panelId]/types
 * Add a ticket type to a panel
 */
export async function POST(
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

        const {
            label,
            categoryId,
            description,
            emoji,
            staffRoles,
            logChannelId,
            maxActiveTickets,
            cooldownMinutes
        } = parsed.data as {
            label: string
            categoryId: string
            description?: string
            emoji?: string
            staffRoles?: string[]
            logChannelId?: string
            maxActiveTickets?: number
            cooldownMinutes?: number
        }

        // Validation
        if (!label || !categoryId) {
            return NextResponse.json(
                { error: "label and categoryId are required" },
                { status: 400 }
            )
        }

        if (!validateGuildId(categoryId)) {
            return NextResponse.json({ error: "Invalid category ID" }, { status: 400 })
        }

        if (label.length > 100) {
            return NextResponse.json(
                { error: "Label must be 100 characters or less" },
                { status: 400 }
            )
        }

        if (description && description.length > 100) {
            return NextResponse.json(
                { error: "Description must be 100 characters or less" },
                { status: 400 }
            )
        }

        // Validate staff roles
        if (staffRoles && !Array.isArray(staffRoles)) {
            return NextResponse.json({ error: "staffRoles must be an array" }, { status: 400 })
        }

        if (staffRoles) {
            for (const roleId of staffRoles) {
                if (!validateGuildId(roleId)) {
                    return NextResponse.json({ error: "Invalid role ID in staffRoles" }, { status: 400 })
                }
            }
        }

        // Validate log channel
        if (logChannelId && !validateGuildId(logChannelId)) {
            return NextResponse.json({ error: "Invalid log channel ID" }, { status: 400 })
        }

        await connectToDatabase()

        const panel = await TicketPanel.findByPanelId(guildId, panelId)

        if (!panel) {
            return NextResponse.json({ error: "Panel not found" }, { status: 404 })
        }

        // Check if we're at the max types (25 for select menu limit)
        if (panel.ticketTypes.length >= 25) {
            return NextResponse.json(
                { error: "Maximum of 25 ticket types per panel" },
                { status: 400 }
            )
        }

        // Add the type
        await panel.addTicketType({
            label,
            categoryId,
            description: description || '',
            emoji: emoji || undefined,
            staffRoles: staffRoles || [],
            logChannelId: logChannelId || undefined,
            maxActiveTickets: maxActiveTickets || 1,
            cooldownMinutes: cooldownMinutes || 0
        })

        return NextResponse.json({
            success: true,
            panel
        })
    } catch (error) {
        console.error("Error adding ticket type:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
