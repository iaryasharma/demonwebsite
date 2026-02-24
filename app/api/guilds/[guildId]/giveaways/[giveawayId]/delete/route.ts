import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import Giveaway from "@/lib/models/Giveaway"
import { deleteMessage } from "@/lib/discord"

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ guildId: string; giveawayId: string }> }
) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId, giveawayId } = await params

    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        await connectToDatabase()

        const giveaway = await Giveaway.findOne({ _id: giveawayId, guildId })
        if (!giveaway) {
            return NextResponse.json({ error: "Giveaway not found" }, { status: 404 })
        }

        // Try to delete Discord message (might fail if already deleted, that's ok)
        await deleteMessage(giveaway.channelId, giveaway.messageId)

        // Delete from database
        await Giveaway.deleteOne({ _id: giveaway._id })

        return NextResponse.json({
            success: true,
            message: "Giveaway deleted successfully.",
        })
    } catch (error) {
        console.error("Error deleting giveaway:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
