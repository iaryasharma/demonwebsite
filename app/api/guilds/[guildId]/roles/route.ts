import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const DISCORD_API = "https://discord.com/api/v10"

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ guildId: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId } = await params
    const token = process.env.DISCORD_BOT_TOKEN

    if (!token) {
        return NextResponse.json(
            { error: "Bot token not configured" },
            { status: 500 }
        )
    }

    try {
        const res = await fetch(`${DISCORD_API}/guilds/${guildId}/roles`, {
            headers: { Authorization: `Bot ${token}` },
        })

        if (!res.ok) {
            return NextResponse.json(
                { error: "Failed to fetch roles" },
                { status: res.status }
            )
        }

        const roles = await res.json()

        // Filter out @everyone (position 0) and managed roles (bot roles), sort by position desc
        const filteredRoles = roles
            .filter((r: any) => r.name !== "@everyone" && !r.managed)
            .sort((a: any, b: any) => b.position - a.position)
            .map((r: any) => ({
                id: r.id,
                name: r.name,
                color: r.color ? `#${r.color.toString(16).padStart(6, "0")}` : null,
                position: r.position,
            }))

        return NextResponse.json(filteredRoles)
    } catch (error) {
        console.error("Error fetching guild roles:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
