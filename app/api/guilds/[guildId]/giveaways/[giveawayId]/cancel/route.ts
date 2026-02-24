import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Giveaway from "@/lib/models/Giveaway"
import { editMessage } from "@/lib/discord"
import { buildCancelledEmbed } from "@/lib/giveaway-embeds"

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

        // Update Discord message with cancelled embed
        const cancelledEmbed = buildCancelledEmbed(giveaway)
        await editMessage(giveaway.channelId, giveaway.messageId, {
            embeds: [cancelledEmbed],
            components: [],
        })

        return NextResponse.json({
            success: true,
            message: "Giveaway cancelled successfully.",
        })
    } catch (error) {
        console.error("Error cancelling giveaway:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
