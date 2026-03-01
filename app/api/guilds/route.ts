import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { getAccessTokenFromRequest, requireManageGuild, fetchUserGuilds, fetchBotGuilds } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import Guild from "@/lib/models/Guild"

export async function GET(request: Request) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // Fetch user's guilds from Discord API (Using cached wrapper to prevent 429s)
        const guilds = await fetchUserGuilds(accessToken)

        // Filter to guilds where user has MANAGE_GUILD permission (bit 0x20)
        const manageableGuilds = guilds.filter(
            (g: any) => (parseInt(g.permissions) & 0x20) === 0x20
        )

        // Fetch bot's guilds from Discord API
        const botGuildIds = await fetchBotGuilds()

        // Map to a clean shape — do NOT expose raw permissions
        const result = manageableGuilds.map((g: any) => ({
            id: g.id,
            name: g.name,
            icon: g.icon
                ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.${g.icon.startsWith("a_") ? "gif" : "webp"}?size=128`
                : null,
            memberCount: g.approximate_member_count || null,
            botPresent: botGuildIds.has(g.id)
        }))

        return NextResponse.json(result)
    } catch (error) {
        console.error("Error fetching guilds:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
