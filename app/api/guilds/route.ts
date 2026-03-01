import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { getAccessTokenFromRequest, requireManageGuild, fetchUserGuilds, fetchBotGuilds, isBotInGuild } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import Guild from "@/lib/models/Guild"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get("refresh") === "true"

    try {
        // Fetch user's guilds from Discord API
        const guilds = await fetchUserGuilds(accessToken, forceRefresh)

        // Filter to guilds where user has MANAGE_GUILD (0x20), ADMINISTRATOR (0x8) or is OWNER
        const manageableGuilds = guilds.filter((g: any) => {
            const perms = parseInt(g.permissions)
            return (perms & 0x20) === 0x20 || (perms & 0x8) === 0x8 || g.owner === true
        })

        // Fetch bot's guilds from Discord API
        const botGuildIds = await fetchBotGuilds(forceRefresh)

        // Map to a clean shape — do NOT expose raw permissions
        // We use Promise.all to handle potential direct presence checks for guilds not in cache
        const result = await Promise.all(manageableGuilds.map(async (g: any) => {
            // If in cache, immediately true. If not, we do a direct check.
            let botPresent = botGuildIds.has(g.id)
            if (!botPresent) {
                // Double check for recently joined guilds
                botPresent = await isBotInGuild(g.id)
            }

            return {
                id: g.id,
                name: g.name,
                icon: g.icon
                    ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.${g.icon.startsWith("a_") ? "gif" : "webp"}?size=128`
                    : null,
                memberCount: g.approximate_member_count || null,
                botPresent
            }
        }))

        return NextResponse.json(result)
    } catch (error) {
        console.error("Error fetching guilds:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
