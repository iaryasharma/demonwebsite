import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Giveaway from "@/lib/models/Giveaway"
import { deleteMessage } from "@/lib/discord"

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ guildId: string; giveawayId: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId, giveawayId } = await params

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
