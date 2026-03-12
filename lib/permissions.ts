/**
 * Server-side permission helpers for Discord guild access control.
 * Uses the user's OAuth access token (from JWT) to verify guild permissions.
 */

import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"

const DISCORD_API = "https://discord.com/api/v10"

// Discord snowflake IDs are 17-20 digit numeric strings
const SNOWFLAKE_RE = /^\d{17,20}$/

/**
 * Validate that a guild/channel/role ID looks like a valid Discord snowflake.
 * Rejects strings that could be used for NoSQL injection or path traversal.
 */
export function validateGuildId(id: string): boolean {
    return typeof id === "string" && SNOWFLAKE_RE.test(id)
}

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
        const token = await getToken({
            req: request as any,
            secret: process.env.NEXTAUTH_SECRET,
        })

        if (!token) {
            console.log("[Auth] No JWT token found in request")
            return null
        }

        const accessToken = (token as any)?.accessToken
        if (!accessToken) {
            console.log("[Auth] JWT token exists but no accessToken field")
            return null
        }

        return accessToken
    } catch (error) {
        console.error("[Auth] Error retrieving access token:", error)
        return null
    }
}

// ── User Guilds Cache ────────────────────────────────────────────────────────
const userGuildsCache = new Map<string, { promise: Promise<UserGuild[]>; expiry: number }>()
const USER_GUILDS_TTL_MS = 30_000 // 30 seconds – short enough to feel real-time

export async function fetchUserGuilds(accessToken: string, force = false): Promise<UserGuild[]> {
    const now = Date.now()
    const cached = userGuildsCache.get(accessToken)

    if (!force && cached && cached.expiry > now) {
        return cached.promise
    }

    const fetchPromise = fetch(`${DISCORD_API}/users/@me/guilds?with_counts=true`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
    })
        .then(async (res) => {
            if (!res.ok) {
                const statusText = res.statusText || "Unknown Error"
                console.error(`[User Guilds] Discord returned ${res.status} ${statusText}`)
                
                if (res.status === 401) {
                    console.error("[User Guilds] Token is invalid or expired - user needs to re-authenticate")
                }
                
                try {
                    const errorBody = await res.text()
                    if (errorBody) {
                        console.error(`[User Guilds] Discord error response: ${errorBody.substring(0, 200)}`)
                    }
                } catch {
                    // Ignore error body parsing failures
                }
                
                return []
            }
            return res.json()
        })
        .catch((err) => {
            console.error("[User Guilds] Fetch error:", err)
            return []
        })

    userGuildsCache.set(accessToken, { promise: fetchPromise, expiry: now + USER_GUILDS_TTL_MS })
    return fetchPromise
}

// ── Bot Guilds Cache ─────────────────────────────────────────────────────────
// We intentionally do NOT use a module-level cache here.
// In Next.js dev mode, HMR re-evaluates modules mid-flight which can leave
// stale or empty cache entries. Since this is called at most once per dashboard
// page-load, the extra Discord API call is negligible.

/**
 * Fetch every guild the bot is currently in via paginated Discord API calls.
 * Always fetches fresh data — no module-level cache to avoid HMR stale state.
 */
export async function fetchBotGuilds(): Promise<Set<string>> {
    const rawToken = process.env.DISCORD_BOT_TOKEN
    if (!rawToken) {
        console.error("[Bot Guilds] DISCORD_BOT_TOKEN is not set")
        return new Set<string>()
    }
    // Strip any accidental "Bot " prefix that might have been added to the env value
    const token = rawToken.startsWith("Bot ") ? rawToken.slice(4) : rawToken

    const botGuilds = new Set<string>()
    let after = ""
    let consecutiveErrors = 0
    const MAX_ERRORS = 3

    while (true) {
        const url = `${DISCORD_API}/users/@me/guilds?limit=200${after ? `&after=${after}` : ""}`

        let res: Response
        try {
            res = await fetch(url, {
                headers: { Authorization: `Bot ${token}` },
                cache: "no-store",
            })
        } catch (err) {
            consecutiveErrors++
            console.error(`[Bot Guilds] Network error (${consecutiveErrors}/${MAX_ERRORS}):`, err)
            if (consecutiveErrors >= MAX_ERRORS) break
            await new Promise(r => setTimeout(r, 250 * consecutiveErrors))
            continue
        }

        if (res.status === 429) {
            const retryAfter = res.headers.get("Retry-After")
            const waitMs = retryAfter ? parseFloat(retryAfter) * 1000 : 1000
            console.warn(`[Bot Guilds] Rate limited. Waiting ${waitMs}ms`)
            await new Promise(r => setTimeout(r, waitMs))
            continue
        }

        if (!res.ok) {
            consecutiveErrors++
            console.error(`[Bot Guilds] HTTP ${res.status} (${consecutiveErrors}/${MAX_ERRORS})`)
            if (consecutiveErrors >= MAX_ERRORS) break
            await new Promise(r => setTimeout(r, 250 * consecutiveErrors))
            continue
        }

        consecutiveErrors = 0
        const data: Array<{ id: string }> = await res.json()
        if (!Array.isArray(data) || data.length === 0) break

        for (const g of data) botGuilds.add(String(g.id))
        if (data.length < 200) break
        after = data[data.length - 1].id
    }

    console.log(`[Bot Guilds] Fetched ${botGuilds.size} guilds`)
    return botGuilds
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
