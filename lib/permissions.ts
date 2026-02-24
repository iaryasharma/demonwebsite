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

interface UserGuild {
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
 */
async function fetchUserGuilds(accessToken: string): Promise<UserGuild[]> {
    const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) return []
    return res.json()
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
