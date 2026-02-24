import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Giveaway from "@/lib/models/Giveaway"
import { sendMessage } from "@/lib/discord"
import { buildActiveEmbed } from "@/lib/giveaway-embeds"

// Duration parser matching bot's parseDuration
function parseDuration(durationStr: string): number | null {
    const regex = /(\d+)\s*(s|sec|second|seconds|m|min|minute|minutes|h|hr|hour|hours|d|day|days|w|week|weeks)/gi
    let total = 0
    let match

    while ((match = regex.exec(durationStr)) !== null) {
        const value = parseInt(match[1])
        const unit = match[2].toLowerCase()

        switch (unit) {
            case "s": case "sec": case "second": case "seconds":
                total += value * 1000; break
            case "m": case "min": case "minute": case "minutes":
                total += value * 60 * 1000; break
            case "h": case "hr": case "hour": case "hours":
                total += value * 60 * 60 * 1000; break
            case "d": case "day": case "days":
                total += value * 24 * 60 * 60 * 1000; break
            case "w": case "week": case "weeks":
                total += value * 7 * 24 * 60 * 60 * 1000; break
        }
    }

    return total > 0 ? total : null
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ guildId: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId } = await params

    try {
        const body = await request.json()
        const { channelId, prize, description, duration, winnerCount, requiredRole } = body

        // Validation
        if (!channelId || !prize || !duration) {
            return NextResponse.json(
                { error: "Channel, prize, and duration are required" },
                { status: 400 }
            )
        }

        if (prize.length > 256) {
            return NextResponse.json(
                { error: "Prize must be 256 characters or less" },
                { status: 400 }
            )
        }

        const durationMs = parseDuration(duration)
        if (!durationMs) {
            return NextResponse.json(
                { error: "Invalid duration format. Use: 10s, 5m, 2h, 1d, 1d2h30m" },
                { status: 400 }
            )
        }

        if (durationMs < 10000) {
            return NextResponse.json(
                { error: "Duration must be at least 10 seconds" },
                { status: 400 }
            )
        }

        if (durationMs > 30 * 24 * 60 * 60 * 1000) {
            return NextResponse.json(
                { error: "Duration must be 30 days or less" },
                { status: 400 }
            )
        }

        const winners = Math.min(Math.max(parseInt(winnerCount) || 1, 1), 50)

        // Calculate times
        const startTime = new Date()
        const endTime = new Date(Date.now() + durationMs)

        // Build the giveaway embed
        const giveawayData = {
            prize,
            description: description?.trim() || null,
            requiredRole: requiredRole?.trim() || null,
            winnerCount: winners,
            hostId: (session as any).user?.id || "dashboard",
            endTime,
            endedAt: null,
            participants: [],
            winners: [],
            messageId: "temp",
            channelId,
            guildId,
        }

        const activeEmbed = buildActiveEmbed(giveawayData)

        // Build the enter/leave buttons (matching bot's createGiveawayButtons)
        const components = [
            {
                type: 1, // ActionRow
                components: [
                    {
                        type: 2, // Button
                        style: 3, // Success (green)
                        label: "Enter Giveaway",
                        emoji: { name: "🎉" },
                        custom_id: "giveaway_enter_temp", // Updated after send
                    },
                    {
                        type: 2, // Button
                        style: 2, // Secondary (gray)
                        label: "Leave",
                        emoji: { name: "❌" },
                        custom_id: "giveaway_leave_temp",
                    },
                    {
                        type: 2, // Button
                        style: 1, // Primary (blue)
                        label: "Show Participants",
                        emoji: { name: "👥" },
                        custom_id: "giveaway_participants_temp",
                    },
                ],
            },
        ]

        // Send message to Discord channel
        const sendResult = await sendMessage(channelId, {
            embeds: [activeEmbed],
            components,
        })

        if (!sendResult.ok) {
            return NextResponse.json(
                { error: `Failed to send giveaway message: ${sendResult.error}` },
                { status: 500 }
            )
        }

        // We need the message ID from the response — update sendMessage to return body
        // For now, fetch the message we just sent
        const token = process.env.DISCORD_BOT_TOKEN
        const msgRes = await fetch(
            `https://discord.com/api/v10/channels/${channelId}/messages?limit=1`,
            { headers: { Authorization: `Bot ${token}` } }
        )
        const messages = await msgRes.json()
        const messageId = messages[0]?.id

        if (!messageId) {
            return NextResponse.json(
                { error: "Failed to retrieve sent message ID" },
                { status: 500 }
            )
        }

        // Update buttons with actual message ID
        const updatedComponents = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 3,
                        label: "Enter Giveaway",
                        emoji: { name: "🎉" },
                        custom_id: `giveaway_enter_${messageId}`,
                    },
                    {
                        type: 2,
                        style: 2,
                        label: "Leave",
                        emoji: { name: "❌" },
                        custom_id: `giveaway_leave_${messageId}`,
                    },
                    {
                        type: 2,
                        style: 1,
                        label: "Show Participants",
                        emoji: { name: "👥" },
                        custom_id: `giveaway_participants_${messageId}`,
                    },
                ],
            },
        ]

        // Edit the message to update button custom_ids
        await fetch(
            `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bot ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ components: updatedComponents }),
            }
        )

        // Save to database
        await connectToDatabase()

        const giveaway = new Giveaway({
            messageId,
            channelId,
            guildId,
            hostId: (session as any).user?.id || "dashboard",
            prize,
            description: description?.trim() || null,
            requiredRole: requiredRole?.trim() || null,
            winnerCount: winners,
            duration: durationMs,
            startTime,
            endTime,
        })

        await giveaway.save()

        return NextResponse.json({
            success: true,
            giveaway: {
                _id: giveaway._id,
                messageId,
                channelId,
                prize,
                endTime: endTime.toISOString(),
            },
            message: `Giveaway created successfully! Prize: ${prize}`,
        })
    } catch (error) {
        console.error("Error creating giveaway:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
