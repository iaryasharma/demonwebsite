/**
 * Discord REST API helper — lightweight alternative to discord.js
 * Uses the bot token to interact with Discord API directly via fetch().
 */

const DISCORD_API = "https://discord.com/api/v10"

function getHeaders() {
    const token = process.env.DISCORD_BOT_TOKEN
    if (!token) throw new Error("DISCORD_BOT_TOKEN is not configured")

    return {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
    }
}

export interface DiscordEmbed {
    title?: string
    description?: string
    color?: number
    footer?: { text: string; icon_url?: string }
    timestamp?: string
    fields?: { name: string; value: string; inline?: boolean }[]
    author?: { name: string; icon_url?: string }
    thumbnail?: { url: string }
    image?: { url: string }
}

export interface DiscordMessagePayload {
    content?: string
    embeds?: DiscordEmbed[]
    components?: any[]
}

/**
 * Edit a message in a channel
 */
export async function editMessage(
    channelId: string,
    messageId: string,
    payload: DiscordMessagePayload
): Promise<{ ok: boolean; status: number; error?: string }> {
    try {
        const res = await fetch(
            `${DISCORD_API}/channels/${channelId}/messages/${messageId}`,
            {
                method: "PATCH",
                headers: getHeaders(),
                body: JSON.stringify(payload),
                cache: "no-store"
            }
        )

        if (!res.ok) {
            const body = await res.text()
            console.error(`Discord edit message error: ${res.status}`, body)
            return { ok: false, status: res.status, error: body }
        }

        return { ok: true, status: res.status }
    } catch (error) {
        console.error("Error editing Discord message:", error)
        return { ok: false, status: 500, error: "Network error" }
    }
}

/**
 * Delete a message from a channel
 */
export async function deleteMessage(
    channelId: string,
    messageId: string
): Promise<{ ok: boolean; status: number; error?: string }> {
    try {
        const res = await fetch(
            `${DISCORD_API}/channels/${channelId}/messages/${messageId}`,
            {
                method: "DELETE",
                headers: getHeaders(),
                cache: "no-store"
            }
        )

        if (!res.ok) {
            const body = await res.text()
            console.error(`Discord delete message error: ${res.status}`, body)
            return { ok: false, status: res.status, error: body }
        }

        return { ok: true, status: res.status }
    } catch (error) {
        console.error("Error deleting Discord message:", error)
        return { ok: false, status: 500, error: "Network error" }
    }
}

/**
 * Send a message to a channel
 */
export async function sendMessage(
    channelId: string,
    payload: DiscordMessagePayload
): Promise<{ ok: boolean; status: number; error?: string }> {
    try {
        const res = await fetch(
            `${DISCORD_API}/channels/${channelId}/messages`,
            {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(payload),
                cache: "no-store"
            }
        )

        if (!res.ok) {
            const body = await res.text()
            console.error(`Discord send message error: ${res.status}`, body)
            return { ok: false, status: res.status, error: body }
        }

        return { ok: true, status: res.status }
    } catch (error) {
        console.error("Error sending Discord message:", error)
        return { ok: false, status: 500, error: "Network error" }
    }
}

/**
 * Get bot user info (for avatar URL in embeds)
 */
export async function getBotUser(): Promise<{
    id: string
    username: string
    avatar: string | null
} | null> {
    try {
        const res = await fetch(`${DISCORD_API}/users/@me`, {
            headers: getHeaders(),
            cache: "no-store"
        })

        if (!res.ok) return null

        const data = await res.json()
        return { id: data.id, username: data.username, avatar: data.avatar }
    } catch {
        return null
    }
}
