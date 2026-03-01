import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild } from "@/lib/permissions"

const DISCORD_API = "https://discord.com/api/v10"

// Server-side TTL cache: per guild, holds the resolved channel array for 3 minutes.
// This prevents duplicate Discord API calls when multiple modules load on the same server.
const channelCache = new Map<string, { data: any[]; expiry: number }>()
const CHANNEL_CACHE_TTL_MS = 3 * 60 * 1000 // 3 minutes

export async function GET(
    request: Request,
    context: { params: Promise<{ guildId: string }> }
) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId } = await context.params

    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Return from cache if still valid
    const now = Date.now()
    const cached = channelCache.get(guildId)
    if (cached && cached.expiry > now) {
        return NextResponse.json(cached.data, {
            headers: { "X-Cache": "HIT" }
        })
    }

    const token = process.env.DISCORD_BOT_TOKEN
    if (!token) {
        return NextResponse.json({ error: "Bot token not configured" }, { status: 500 })
    }

    try {
        const res = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
            headers: { Authorization: `Bot ${token}` },
        })

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch channels" }, { status: res.status })
        }

        const rawChannels = await res.json()

        // Include text (0), announcement (5), voice (2) channels — sorted by position
        const channels = rawChannels
            .filter((ch: any) => ch.type === 0 || ch.type === 2 || ch.type === 5)
            .sort((a: any, b: any) => a.position - b.position)
            .map((ch: any) => ({
                id: ch.id,
                name: ch.name,
                type: ch.type,
                position: ch.position,
                parentId: ch.parent_id || null,
            }))

        // Store in cache
        channelCache.set(guildId, { data: channels, expiry: now + CHANNEL_CACHE_TTL_MS })

        return NextResponse.json(channels, {
            headers: { "X-Cache": "MISS" }
        })
    } catch (error) {
        console.error("Error fetching guild channels:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
