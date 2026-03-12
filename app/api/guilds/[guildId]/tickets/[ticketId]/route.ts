import { NextRequest, NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import Ticket from "@/lib/models/Ticket"

export const dynamic = "force-dynamic"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ guildId: string; ticketId: string }> }
) {
    try {
        const accessToken = await getAccessTokenFromRequest(req)
        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { guildId, ticketId } = await params

        if (!validateGuildId(guildId)) {
            return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 })
        }

        if (!(await requireManageGuild(accessToken, guildId))) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await connectToDatabase()
        const ticket = await Ticket.findById(ticketId)

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
        }

        if (ticket.guildId !== guildId) {
            return NextResponse.json({ error: "Ticket does not belong to this guild" }, { status: 400 })
        }

        return NextResponse.json(ticket)
    } catch (error) {
        console.error("[SECURITY] Ticket GET error:", error)
        return NextResponse.json(
            { error: "Service temporarily unavailable" },
            { status: 503 }
        )
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ guildId: string; ticketId: string }> }
) {
    try {
        const accessToken = await getAccessTokenFromRequest(req)
        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { guildId, ticketId } = await params

        if (!validateGuildId(guildId)) {
            return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 })
        }

        if (!(await requireManageGuild(accessToken, guildId))) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { status, priority, claim, addUser, removeUser } = body

        await connectToDatabase()
        const ticket = await Ticket.findById(ticketId)

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
        }

        if (ticket.guildId !== guildId) {
            return NextResponse.json({ error: "Ticket does not belong to this guild" }, { status: 400 })
        }

        // Handle different update actions
        if (status !== undefined) {
            if (!["open", "closed", "locked"].includes(status)) {
                return NextResponse.json({ error: "Invalid status" }, { status: 400 })
            }

            if (status === "closed") {
                // Use a placeholder user ID (dashboard user ID would need to be retrieved from session)
                ticket.closeTicket("dashboard")
            } else {
                ticket.status = status
                if (status === "open" && ticket.closedAt) {
                    // Reopening
                    ticket.closedAt = null
                    ticket.closedBy = null
                }
            }
        }

        if (priority !== undefined) {
            if (!["low", "normal", "high"].includes(priority)) {
                return NextResponse.json({ error: "Invalid priority" }, { status: 400 })
            }
            ticket.changePriority(priority)
        }

        if (claim !== undefined) {
            if (claim === true) {
                // Use placeholder for dashboard claims (would need Discord user ID)
                ticket.claimTicket("dashboard")
            } else if (claim === false) {
                ticket.unclaimTicket()
            }
        }

        if (addUser) {
            if (typeof addUser !== "string" || addUser.length < 17 || addUser.length > 20) {
                return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
            }
            ticket.addUser(addUser)
        }

        if (removeUser) {
            if (typeof removeUser !== "string") {
                return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
            }
            ticket.removeUser(removeUser)
        }

        await ticket.save()

        return NextResponse.json({
            message: "Ticket updated successfully",
            ticket,
        })
    } catch (error) {
        console.error("[SECURITY] Ticket PATCH error:", error)
        return NextResponse.json(
            { error: "Service temporarily unavailable" },
            { status: 503 }
        )
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ guildId: string; ticketId: string }> }
) {
    try {
        const accessToken = await getAccessTokenFromRequest(req)
        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { guildId, ticketId } = await params

        if (!validateGuildId(guildId)) {
            return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 })
        }

        if (!(await requireManageGuild(accessToken, guildId))) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await connectToDatabase()
        const ticket = await Ticket.findById(ticketId)

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
        }

        if (ticket.guildId !== guildId) {
            return NextResponse.json({ error: "Ticket does not belong to this guild" }, { status: 400 })
        }

        await Ticket.findByIdAndDelete(ticketId)

        return NextResponse.json({ message: "Ticket deleted successfully" })
    } catch (error) {
        console.error("[SECURITY] Ticket DELETE error:", error)
        return NextResponse.json(
            { error: "Service temporarily unavailable" },
            { status: 503 }
        )
    }
}
