/**
 * Server-side giveaway embed builders
 * Replicates the bot's createGiveawayEmbed / createWinnerNotification as plain JSON
 */

import type { DiscordEmbed, DiscordMessagePayload } from "./discord"

// Bot's color palette (matching client.color values)
const COLORS = {
    active: 0x00ff00,
    ended: 0xff0000,
    cancelled: 0xff0000,
    winner: 0xffd700,
}

interface GiveawayData {
    prize: string
    description?: string | null
    requiredRole?: string | null
    winnerCount: number
    hostId: string
    endTime: Date
    endedAt?: Date | null
    participants: string[]
    winners: string[]
    messageId: string
    channelId: string
    guildId: string
}

/**
 * Build the active giveaway embed (matches bot's format exactly)
 */
export function buildActiveEmbed(giveaway: GiveawayData): DiscordEmbed {
    const lines = [
        `🎁 **Prize:** ${giveaway.prize}`,
        `🏆 **Winner(s):** ${giveaway.winnerCount}`,
    ]

    if (giveaway.description) {
        lines.push(`📝 **Description:** ${giveaway.description}`, "")
    }

    lines.push(`👤 **Hosted by:** <@${giveaway.hostId}>`)

    if (giveaway.requiredRole) {
        lines.push(`🎭 **Required Role:** <@&${giveaway.requiredRole}>`)
    }

    lines.push(
        `⏰ **Ends:** <t:${Math.floor(giveaway.endTime.getTime() / 1000)}:R> (<t:${Math.floor(giveaway.endTime.getTime() / 1000)}:f>)`,
        `👥 **Participants:** ${giveaway.participants.length}`
    )

    return {
        title: "🎉 **GIVEAWAY** 🎉",
        description: lines.join("\n"),
        color: COLORS.active,
        footer: { text: "Click the Enter button to participate!" },
        timestamp: new Date().toISOString(),
    }
}

/**
 * Build the ended giveaway embed
 */
export function buildEndedEmbed(giveaway: GiveawayData): DiscordEmbed {
    const winnerList =
        giveaway.winners.length > 0
            ? giveaway.winners.map((id) => `<@${id}>`).join(", ")
            : "No valid participants"

    const endedAt = giveaway.endedAt || new Date()

    const lines = [
        `🎁 **Prize:** ${giveaway.prize}`,
        `🏆 **Winner(s):** ${winnerList}`,
    ]

    if (giveaway.description) {
        lines.push(`📝 **Description:** ${giveaway.description}`, "")
    }

    lines.push(
        `👤 **Hosted by:** <@${giveaway.hostId}>`,
        `⏰ **Ended:** <t:${Math.floor(endedAt.getTime() / 1000)}:R> (<t:${Math.floor(endedAt.getTime() / 1000)}:f>)`,
        `👥 **Participants:** ${giveaway.participants.length}`
    )

    return {
        title: "🎉 **GIVEAWAY ENDED** 🎉",
        description: lines.join("\n"),
        color: COLORS.ended,
        footer: { text: "Giveaway has ended" },
        timestamp: endedAt.toISOString(),
    }
}

/**
 * Build the cancelled giveaway embed
 */
export function buildCancelledEmbed(giveaway: GiveawayData): DiscordEmbed {
    const cancelledAt = giveaway.endedAt || new Date()

    const lines = [
        `🎁 **Prize:** ${giveaway.prize}`,
        `🏆 **Status:** Giveaway cancelled`,
    ]

    if (giveaway.description) {
        lines.push(`📝 **Description:** ${giveaway.description}`, "")
    }

    lines.push(
        `👤 **Hosted by:** <@${giveaway.hostId}>`,
        `⏰ **Cancelled:** <t:${Math.floor(cancelledAt.getTime() / 1000)}:R> (<t:${Math.floor(cancelledAt.getTime() / 1000)}:f>)`,
        `👥 **Participants:** ${giveaway.participants.length}`
    )

    return {
        title: "❌ **GIVEAWAY CANCELLED** ❌",
        description: lines.join("\n"),
        color: COLORS.cancelled,
        footer: { text: "Giveaway was cancelled" },
        timestamp: new Date().toISOString(),
    }
}

/**
 * Build the winner notification message
 */
export function buildWinnerNotification(
    giveaway: GiveawayData,
    isReroll = false
): DiscordMessagePayload {
    const winnerMentions = giveaway.winners.map((id) => `<@${id}>`).join(" ")

    const title = isReroll
        ? "🔄 **NEW GIVEAWAY WINNERS!** 🔄"
        : "🎉 **CONGRATULATIONS!** 🎉"

    return {
        content: winnerMentions,
        embeds: [
            {
                title,
                description: `You won: **${giveaway.prize}**\n\nPlease contact the giveaway host <@${giveaway.hostId}> to claim your prize!`,
                color: COLORS.winner,
                timestamp: new Date().toISOString(),
            },
        ],
        components: [
            {
                type: 1, // ActionRow
                components: [
                    {
                        type: 2, // Button
                        style: 5, // Link
                        label: "View Giveaway",
                        emoji: { name: "🔗" },
                        url: `https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}`,
                    },
                ],
            },
        ],
    }
}
