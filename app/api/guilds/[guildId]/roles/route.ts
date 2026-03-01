import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild } from "@/lib/permissions"

const DISCORD_API = "https://discord.com/api/v10"

const rolesCache = new Map<string, { promise: Promise<any>, expiry: number }>();
const ROLES_CACHE_TTL = 300000; // 5 minutes

export async function GET(
    request: Request,
    { params }: { params: Promise<{ guildId: string }> }
) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId } = await params

    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const token = process.env.DISCORD_BOT_TOKEN

    if (!token) {
        return NextResponse.json(
            { error: "Bot token not configured" },
            { status: 500 }
        )
    }

    try {
        const cacheKey = `${guildId}`
        const now = Date.now()
        const cached = rolesCache.get(cacheKey)

        if (cached && cached.expiry > now) {
            try {
                return NextResponse.json(await cached.promise)
            } catch {
                // Ignore cache error, let it refetch
            }
        }

        const fetchPromise = fetch(`${DISCORD_API}/guilds/${guildId}/roles`, {
            headers: { Authorization: `Bot ${token}` },
        }).then(async (res) => {
            if (!res.ok) throw new Error("Failed to fetch roles")
            const roles = await res.json()

            // Filter out @everyone (position 0) and managed roles (bot roles), sort by position desc
            return roles
                .filter((r: any) => r.name !== "@everyone" && !r.managed)
                .sort((a: any, b: any) => b.position - a.position)
                .map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    color: r.color ? `#${r.color.toString(16).padStart(6, "0")}` : null,
                    position: r.position,
                }))
        })

        rolesCache.set(cacheKey, { promise: fetchPromise, expiry: now + ROLES_CACHE_TTL })
        const filteredRoles = await fetchPromise

        return NextResponse.json(filteredRoles)
    } catch (error) {
        console.error("Error fetching guild roles:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
