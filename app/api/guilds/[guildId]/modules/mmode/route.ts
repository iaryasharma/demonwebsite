import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getAccessTokenFromRequest, requireManageGuild } from "@/lib/permissions"

const DISCORD_API = "https://discord.com/api/v10"

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ guildId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!(session?.user as any)?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { guildId } = await props.params
        const accessToken = await getAccessTokenFromRequest(req)
        if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const hasPermission = await requireManageGuild(accessToken, guildId)
        if (!hasPermission) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const token = process.env.DISCORD_BOT_TOKEN
        if (!token) return NextResponse.json({ error: "Missing Bot Token" }, { status: 500 })

        // Fetch channels
        const res = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
            headers: { Authorization: `Bot ${token}` }
        })
        if (!res.ok) throw new Error("Failed to fetch channels from Discord")

        const channels = await res.json()
        const isEnabled = channels.some((c: any) => c.name === "maintenance-mode-chat" || c.name === "Maintenance mode VC")

        return NextResponse.json({ enabled: isEnabled })
    } catch (error) {
        console.error("[MMODE_GET]", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ guildId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!(session?.user as any)?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { guildId } = await props.params
        const accessToken = await getAccessTokenFromRequest(req)
        if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const hasPermission = await requireManageGuild(accessToken, guildId)
        if (!hasPermission) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const { enabled } = await req.json()
        const token = process.env.DISCORD_BOT_TOKEN
        if (!token) return NextResponse.json({ error: "Missing Bot Token" }, { status: 500 })

        // Fetch channels
        const res = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
            headers: { Authorization: `Bot ${token}` }
        })
        if (!res.ok) throw new Error("Failed to fetch channels from Discord")
        const channels = await res.json()

        const maintenanceChat = channels.find((c: any) => c.name === "maintenance-mode-chat")
        const maintenanceVC = channels.find((c: any) => c.name === "Maintenance mode VC")

        // 0 = GUILD_TEXT, 2 = GUILD_VOICE, 5 = GUILD_ANNOUNCEMENT
        const targetChannels = channels.filter((c: any) =>
            c.type === 0 || c.type === 2 || c.type === 5
        )

        const headers = {
            Authorization: `Bot ${token}`,
            "Content-Type": "application/json"
        }

        if (enabled) {
            if (maintenanceChat || maintenanceVC) {
                return NextResponse.json({ enabled: true })
            }

            // Lock all text/voice channels
            // SEND_MESSAGES = 1 << 11 = 2048, CONNECT = 1 << 20 = 1048576, VIEW_CHANNEL = 1 << 10 = 1024
            // Wait, we just map mmode.js logic: SendMessages: false, Connect: false, ViewChannel: false
            const denyBits = 1024 | 2048 | 1048576 // 1051648

            await Promise.all(targetChannels.map((c: any) =>
                fetch(`${DISCORD_API}/channels/${c.id}/permissions/${guildId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({
                        id: guildId, // role id
                        type: 0, // role
                        allow: "0",
                        deny: denyBits.toString()
                    })
                }).catch(err => console.error("Error locking channel", c.id, err))
            ))

            // Create Maintenance Chat
            await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: "maintenance-mode-chat",
                    type: 0,
                    permission_overwrites: [
                        {
                            id: guildId,
                            type: 0,
                            allow: (1024 | 65536).toString(), // VIEW_CHANNEL | READ_MESSAGE_HISTORY
                            deny: "2048" // SEND_MESSAGES
                        }
                    ]
                })
            })

            // Create Maintenance VC
            await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: "Maintenance mode VC",
                    type: 2,
                    permission_overwrites: [
                        {
                            id: guildId,
                            type: 0,
                            allow: (1024 | 1048576 | 2097152).toString(), // VIEW_CHANNEL | CONNECT | SPEAK
                            deny: "0"
                        }
                    ]
                })
            })

            return NextResponse.json({ enabled: true })

        } else {
            // Disable mmode
            if (!maintenanceChat && !maintenanceVC) {
                return NextResponse.json({ enabled: false })
            }

            // Delete maintenance channels
            if (maintenanceChat) await fetch(`${DISCORD_API}/channels/${maintenanceChat.id}`, { method: 'DELETE', headers })
            if (maintenanceVC) await fetch(`${DISCORD_API}/channels/${maintenanceVC.id}`, { method: 'DELETE', headers })

            // Unlock channels
            await Promise.all(targetChannels.map((c: any) =>
                fetch(`${DISCORD_API}/channels/${c.id}/permissions/${guildId}`, {
                    method: 'DELETE',
                    headers
                }).catch(err => console.error("Error unlocking channel", c.id, err))
            ))

            return NextResponse.json({ enabled: false })
        }
    } catch (error) {
        console.error("[MMODE_POST]", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
