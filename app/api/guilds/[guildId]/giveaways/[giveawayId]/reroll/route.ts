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

        // Check reroll eligibility
        const rerollCheck = giveaway.canReroll()
        if (!rerollCheck.allowed) {
            return NextResponse.json({ error: rerollCheck.reason }, { status: 400 })
        }

        // Reroll winners
        const result = await giveaway.rerollWinners()
        if (!result.success) {
            return NextResponse.json({ error: result.reason }, { status: 400 })
        }

        // Update Discord message with new winners
        const endedEmbed = buildEndedEmbed(giveaway)
        await editMessage(giveaway.channelId, giveaway.messageId, {
            embeds: [endedEmbed],
            components: [],
        })

        // Send reroll notification if winners exist
        if (giveaway.winners.length > 0) {
            const notification = buildWinnerNotification(giveaway, true)
            await sendMessage(giveaway.channelId, notification)
        }

        return NextResponse.json({
            success: true,
            winners: giveaway.winners,
            message: `Rerolled! ${giveaway.winners.length} new winner(s) selected.`,
        })
    } catch (error) {
        console.error("Error rerolling giveaway:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
