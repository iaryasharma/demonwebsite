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
        const res = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
            headers: { Authorization: `Bot ${token}` },
        })

        if (!res.ok) {
            return NextResponse.json(
                { error: "Failed to fetch channels" },
                { status: res.status }
            )
        }

        const channels = await res.json()

        // Filter to text channels (type 0) and sort by position
        const textChannels = channels
            .filter((ch: any) => ch.type === 0)
            .sort((a: any, b: any) => a.position - b.position)
            .map((ch: any) => ({
                id: ch.id,
                name: ch.name,
                position: ch.position,
                parentId: ch.parent_id || null,
            }))

        return NextResponse.json(textChannels)
    } catch (error) {
        console.error("Error fetching guild channels:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
