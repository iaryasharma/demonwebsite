/**
 * Server-side permission helpers for Discord guild access control.
 * Uses the user's OAuth access token (from JWT) to verify guild permissions.
 */

import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"

const DISCORD_API = "https://discord.com/api/v10"

// Discord permission bits
const MANAGE_GUILD = 0x20
const ADMINISTRATOR = 0x8

export interface UserGuild {
    id: string
    permissions: string
}

/**
 * Get the user's access token from the JWT (server-side only).
 * Returns null if no valid session exists.
 */
export async function getAccessTokenFromRequest(request: Request): Promise<string | null> {
    try {
        // Convert Request to NextRequest for getToken
        const token = await getToken({
            req: request as any,
            secret: process.env.NEXTAUTH_SECRET,
        })
        return (token as any)?.accessToken || null
    } catch {
        return null
    }
}

/**
 * Fetch the user's guild list from Discord using their OAuth token.
 * Uses a TTL-based Map cache to deduplicate concurrent requests and prevent 429s.
 */
const userGuildsCache = new Map<string, { promise: Promise<UserGuild[]>, expiry: number }>()
const CACHE_TTL_MS = 60000 // 60 seconds

export async function fetchUserGuilds(accessToken: string): Promise<UserGuild[]> {
    const now = Date.now()
    const cached = userGuildsCache.get(accessToken)

    // Return the cached promise if it hasn't expired to handle concurrent parallel fetches!
    if (cached && cached.expiry > now) {
        return cached.promise
    }

    const fetchPromise = fetch(`${DISCORD_API}/users/@me/guilds`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    }).then(async (res) => {
        if (!res.ok) return []
        return res.json()
    }).catch(() => [])

    userGuildsCache.set(accessToken, { promise: fetchPromise, expiry: now + CACHE_TTL_MS })
    return fetchPromise
}

/**
 * Fetch all guilds the bot is currently in (Paginated).
 * Uses a TTL-based cache.
 */
const botGuildsCache = { promise: null as Promise<Set<string>> | null, expiry: 0 }
const BOT_GUILDS_TTL_MS = 5 * 60 * 1000 // 5 minutes

export async function fetchBotGuilds(): Promise<Set<string>> {
    const now = Date.now()
    if (botGuildsCache.promise && botGuildsCache.expiry > now) {
        return botGuildsCache.promise
    }

    const fetchPromise = (async () => {
        const token = process.env.DISCORD_BOT_TOKEN
        if (!token) return new Set<string>()

        const botGuilds = new Set<string>()
        let after = ""
        while (true) {
            const url = `${DISCORD_API}/users/@me/guilds?limit=200${after ? `&after=${after}` : ""}`
            const res = await fetch(url, {
                headers: { Authorization: `Bot ${token}` }
            })
            if (!res.ok) break
            const data = await res.json()
            if (!Array.isArray(data) || data.length === 0) break
            for (const g of data) botGuilds.add(g.id)
            if (data.length < 200) break
            after = data[data.length - 1].id
        }
        return botGuilds
    })()

    botGuildsCache.promise = fetchPromise
    botGuildsCache.expiry = now + BOT_GUILDS_TTL_MS
    return fetchPromise
}

/**
 * Check if the user has a specific permission on a guild.
 */
export async function checkGuildPermission(
    accessToken: string,
    guildId: string,
    permissionBit: number
): Promise<boolean> {
    const guilds = await fetchUserGuilds(accessToken)
    const guild = guilds.find((g) => g.id === guildId)

    if (!guild) return false

    const perms = parseInt(guild.permissions)
    // ADMINISTRATOR implies all permissions
    if ((perms & ADMINISTRATOR) === ADMINISTRATOR) return true
    return (perms & permissionBit) === permissionBit
}

/**
 * Verify the user has MANAGE_GUILD permission on the target guild.
 */
export async function requireManageGuild(
    accessToken: string,
    guildId: string
): Promise<boolean> {
    return checkGuildPermission(accessToken, guildId, MANAGE_GUILD)
}

/**
 * Verify the user has ADMINISTRATOR permission on the target guild.
 */
export async function requireAdministrator(
    accessToken: string,
    guildId: string
): Promise<boolean> {
    return checkGuildPermission(accessToken, guildId, ADMINISTRATOR)
}
