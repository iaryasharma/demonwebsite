import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // Fetch user's guilds from Discord API
        const res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
            headers: {
                Authorization: `Bearer ${(session as any).accessToken}`,
            },
        })

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch guilds" }, { status: res.status })
        }

        const guilds = await res.json()

        // Filter to guilds where user has MANAGE_GUILD permission (bit 0x20)
        const manageableGuilds = guilds.filter(
            (g: any) => (parseInt(g.permissions) & 0x20) === 0x20
        )

        // Map to a clean shape
        const result = manageableGuilds.map((g: any) => ({
            id: g.id,
            name: g.name,
            icon: g.icon
                ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.${g.icon.startsWith("a_") ? "gif" : "webp"}?size=128`
                : null,
            memberCount: g.approximate_member_count || null,
            permissions: g.permissions,
        }))

        return NextResponse.json(result)
    } catch (error) {
        console.error("Error fetching guilds:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
