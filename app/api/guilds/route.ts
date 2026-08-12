import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, fetchUserGuilds, fetchBotGuilds } from "@/lib/permissions"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get("refresh") === "true"

    try {
        // Fetch user guilds and bot guilds in parallel — fully independent
        const [allUserGuilds, botGuildIds] = await Promise.all([
            fetchUserGuilds(accessToken, forceRefresh),
            fetchBotGuilds(forceRefresh), // Cache-aware
        ])

        console.log(`[/api/guilds] userGuilds=${allUserGuilds.length} botGuilds=${botGuildIds.size}`)

        // Keep only guilds where the user can manage the server
        const manageableGuilds = (allUserGuilds as any[]).filter((g) => {
            const perms = BigInt(g.permissions ?? "0")
            return (
                g.owner === true ||
                (perms & BigInt(0x8)) === BigInt(0x8) ||   // ADMINISTRATOR
                (perms & BigInt(0x20)) === BigInt(0x20)     // MANAGE_GUILD
            )
        })

        const result = manageableGuilds.map((g: any) => {
            const guildId = String(g.id) // ensure string comparison
            const botPresent = botGuildIds.has(guildId)
            console.log(`[/api/guilds] ${botPresent ? "HIT " : "MISS"}: ${guildId} "${g.name}"`)
            return {
                id: guildId,
                name: g.name,
                icon: g.icon
                    ? `https://cdn.discordapp.com/icons/${guildId}/${g.icon}.${g.icon.startsWith("a_") ? "gif" : "webp"}?size=128`
                    : null,
                memberCount: g.approximate_member_count ?? null,
                botPresent,
            }
        })

        // Bot-present servers first, then alphabetically within each group
        result.sort((a, b) => {
            if (b.botPresent !== a.botPresent) return b.botPresent ? 1 : -1
            return a.name.localeCompare(b.name)
        })

        const response = NextResponse.json(result)
        response.headers.set("Cache-Control", "no-store, max-age=0")
        return response
    } catch (error) {
        console.error("[/api/guilds] Error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
