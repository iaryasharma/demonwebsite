import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import Giveaway from "@/lib/models/Giveaway"
import { editMessage, sendMessage } from "@/lib/discord"
import { buildEndedEmbed, buildWinnerNotification } from "@/lib/giveaway-embeds"
import { validateObjectId } from "@/lib/api-helpers"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ guildId: string; giveawayId: string }> }
) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId, giveawayId } = await params

    if (!validateGuildId(guildId)) {
        return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 })
    }
    if (!validateObjectId(giveawayId)) {
        return NextResponse.json({ error: "Invalid giveaway ID" }, { status: 400 })
    }

    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

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

        // Try to update Discord message (non-fatal if message is stale)
        try {
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
        } catch (discordErr) {
            console.warn("Could not update giveaway Discord message (non-fatal):", discordErr)
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
