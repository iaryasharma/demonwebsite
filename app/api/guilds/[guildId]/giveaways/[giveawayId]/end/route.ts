import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Giveaway from "@/lib/models/Giveaway"
import { editMessage, sendMessage } from "@/lib/discord"
import { buildEndedEmbed, buildWinnerNotification } from "@/lib/giveaway-embeds"

export async function POST(
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

        if (giveaway.isEnded) {
            return NextResponse.json({ error: "Giveaway already ended" }, { status: 400 })
        }

        // End giveaway and select winners
        const result = await giveaway.endGiveaway("dashboard")

        if (!result.success) {
            return NextResponse.json({ error: result.reason }, { status: 400 })
        }

        // Update Discord message with ended embed
        const endedEmbed = buildEndedEmbed(giveaway)
        await editMessage(giveaway.channelId, giveaway.messageId, {
            embeds: [endedEmbed],
            components: [], // Remove interactive buttons
        })

        // Send winner notification if there are winners
        if (giveaway.winners.length > 0) {
            const notification = buildWinnerNotification(giveaway)
            await sendMessage(giveaway.channelId, notification)
        }

        return NextResponse.json({
            success: true,
            winners: giveaway.winners,
            message: `Giveaway ended. ${giveaway.winners.length} winner(s) selected.`,
        })
    } catch (error) {
        console.error("Error ending giveaway:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
