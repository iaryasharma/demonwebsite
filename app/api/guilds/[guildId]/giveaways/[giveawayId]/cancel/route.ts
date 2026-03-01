import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import Giveaway from "@/lib/models/Giveaway"
import { editMessage } from "@/lib/discord"
import { buildCancelledEmbed } from "@/lib/giveaway-embeds"
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

        if (giveaway.isEnded) {
            return NextResponse.json({ error: "Giveaway already ended" }, { status: 400 })
        }

        // Cancel — mark ended without selecting winners
        await Giveaway.updateOne(
            { _id: giveaway._id },
            {
                $set: {
                    isActive: false,
                    isEnded: true,
                    endedBy: "dashboard-cancel",
                    endedAt: new Date(),
                    winners: [],
                },
            }
        )

        // Try to update Discord message — non-fatal if it fails
        // (bot-created giveaway messages may already be stale/deleted)
        try {
            const cancelledEmbed = buildCancelledEmbed(giveaway)
            await editMessage(giveaway.channelId, giveaway.messageId, {
                embeds: [cancelledEmbed],
                components: [],
            })
        } catch (discordErr) {
            console.warn("Could not update giveaway Discord message (non-fatal):", discordErr)
        }

        return NextResponse.json({
            success: true,
            message: "Giveaway cancelled successfully.",
        })
    } catch (error) {
        console.error("Error cancelling giveaway:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
