import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild } from "@/lib/permissions"

const DISCORD_API = "https://discord.com/api/v10"
// In-memory cache for resolved users
const userCache = new Map<string, { data: any; expiry: number }>()
const USER_CACHE_TTL = 600_000

// Cache for bot application info
let botAppInfo: any = null
let botAppInfoExpiry = 0

async function getBotAppInfo(token: string) {
    if (botAppInfo && botAppInfoExpiry > Date.now()) return botAppInfo
    try {
        const res = await fetch(`${DISCORD_API}/applications/@me`, {
            headers: { Authorization: `Bot ${token}` },
        })
        if (res.ok) {
            botAppInfo = await res.json()
            botAppInfoExpiry = Date.now() + 3600_000 // 1 hour cache
            return botAppInfo
        }
    } catch (e) {
        console.error("Failed to fetch bot app info", e)
    }
    return null
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ guildId: string; userId: string }> }
) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId, userId } = await params

    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const token = process.env.DISCORD_BOT_TOKEN
    if (!token) {
        return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 })
    }

    // Normalize userId: strip "team" or other letters if present (common in dashboard IDs)
    const normalizedId = userId.replace(/^[a-z]+(?=\d)/i, "")

    const cacheKey = `${guildId}:${normalizedId}`
    const cached = userCache.get(cacheKey)
    if (cached && cached.expiry > Date.now()) {
        return NextResponse.json(cached.data)
    }

    try {
        const appInfo = await getBotAppInfo(token)
        
        // Special case: Is this the bot itself?
        if (appInfo && normalizedId === appInfo.id) {
            const data = {
                id: normalizedId,
                displayName: appInfo.name,
                username: appInfo.name,
                avatarUrl: appInfo.icon ? `https://cdn.discordapp.com/app-icons/${appInfo.id}/${appInfo.icon}.webp?size=64` : `https://cdn.discordapp.com/embed/avatars/0.png`,
                bot: true,
                systemType: 'bot'
            }
            userCache.set(cacheKey, { data, expiry: Date.now() + USER_CACHE_TTL })
            return NextResponse.json(data)
        }

        // Special case: Is this the owner or team?
        if (appInfo && appInfo.owner && (normalizedId === appInfo.owner.id || (appInfo.team && normalizedId === appInfo.team.id))) {
            const isTeam = !!appInfo.team && normalizedId === appInfo.team.id
            const data = {
                id: normalizedId,
                displayName: isTeam ? appInfo.team.name : (appInfo.owner.global_name || appInfo.owner.username),
                username: isTeam ? "Project Team" : appInfo.owner.username,
                avatarUrl: (isTeam && appInfo.team.icon) 
                    ? `https://cdn.discordapp.com/team-icons/${appInfo.team.id}/${appInfo.team.icon}.webp?size=64`
                    : (appInfo.owner.avatar ? `https://cdn.discordapp.com/avatars/${appInfo.owner.id}/${appInfo.owner.avatar}.webp?size=64` : `https://cdn.discordapp.com/embed/avatars/0.png`),
                bot: false,
                systemType: isTeam ? 'team' : 'owner'
            }
            userCache.set(cacheKey, { data, expiry: Date.now() + USER_CACHE_TTL })
            return NextResponse.json(data)
        }

        // Normal lookup: Try guild member first
        const memberRes = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${normalizedId}`, {
            headers: { Authorization: `Bot ${token}` },
        })

        if (memberRes.ok) {
            const member = await memberRes.json()
            const user = member.user
            const displayName = member.nick || user.global_name || user.username
            const avatarUrl = user.avatar
                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=64`
                : `https://cdn.discordapp.com/embed/avatars/${(parseInt(user.discriminator || '0') % 5)}.png`

            const data = { id: user.id, username: user.username, displayName, avatarUrl, bot: user.bot || false }
            userCache.set(cacheKey, { data, expiry: Date.now() + USER_CACHE_TTL })
            return NextResponse.json(data)
        } else {
            // Fallback: fetch global user
            const userRes = await fetch(`${DISCORD_API}/users/${normalizedId}`, {
                headers: { Authorization: `Bot ${token}` },
            })

            if (userRes.ok) {
                const user = await userRes.json()
                const data = {
                    id: user.id,
                    username: user.username,
                    displayName: user.global_name || user.username,
                    avatarUrl: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=64` : `https://cdn.discordapp.com/embed/avatars/0.png`,
                    bot: user.bot || false,
                }
                userCache.set(cacheKey, { data, expiry: Date.now() + USER_CACHE_TTL })
                return NextResponse.json(data)
            }
        }

        // Unknown - fallback to ID
        return NextResponse.json({
            id: normalizedId,
            username: "Unknown User",
            displayName: userId, // Keep original ID string (e.g. "team795...") if resolution fails
            avatarUrl: `https://cdn.discordapp.com/embed/avatars/0.png`,
            bot: false
        })
    } catch (error) {
        console.error("[user-resolve] Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
