import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const DISCORD_API = "https://discord.com/api/v10"

async function getGuildChannels(guildId: string, token: string) {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
        headers: { Authorization: `Bot ${token}` },
    })
    if (!res.ok) throw new Error("Failed to fetch channels")
    return res.json()
}

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
        return NextResponse.json({ error: "Bot token not configured" }, { status: 500 })
    }

    try {
        const channels = await getGuildChannels(guildId, token)
        const maintenanceChat = channels.find((c: any) => c.name === "maintenance-mode-chat")
        const maintenanceVC = channels.find((c: any) => c.name === "Maintenance mode VC")

        return NextResponse.json({
            active: !!(maintenanceChat || maintenanceVC),
            chatChannelId: maintenanceChat?.id || null,
            vcChannelId: maintenanceVC?.id || null,
        })
    } catch (error) {
        console.error("Error checking maintenance status:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ guildId: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId } = await params
    const token = process.env.DISCORD_BOT_TOKEN

    if (!token) {
        return NextResponse.json({ error: "Bot token not configured" }, { status: 500 })
    }

    try {
        const body = await request.json()
        const { action } = body

        if (!["start", "stop"].includes(action)) {
            return NextResponse.json(
                { error: "action must be 'start' or 'stop'" },
                { status: 400 }
            )
        }

        const channels = await getGuildChannels(guildId, token)

        if (action === "start") {
            // Check if already active
            const existing = channels.find((c: any) => c.name === "maintenance-mode-chat")
            if (existing) {
                return NextResponse.json(
                    { error: "Maintenance mode is already active" },
                    { status: 400 }
                )
            }

            // Lock all text and voice channels
            const lockableChannels = channels.filter(
                (c: any) => c.type === 0 || c.type === 2 // text or voice
            )

            for (const ch of lockableChannels) {
                try {
                    await fetch(
                        `${DISCORD_API}/channels/${ch.id}/permissions/${guildId}`,
                        {
                            method: "PUT",
                            headers: {
                                Authorization: `Bot ${token}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                id: guildId,
                                type: 0,
                                deny: String(
                                    (1n << 11n) | // SendMessages
                                    (1n << 20n) | // Connect
                                    (1n << 10n)   // ViewChannel
                                ),
                                allow: "0",
                            }),
                        }
                    )
                } catch (e) {
                    // Continue even if one channel fails
                }
            }

            // Create maintenance text channel
            const chatRes = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
                method: "POST",
                headers: {
                    Authorization: `Bot ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: "maintenance-mode-chat",
                    type: 0,
                    permission_overwrites: [
                        {
                            id: guildId,
                            type: 0,
                            allow: String((1n << 10n) | (1n << 16n)), // ViewChannel + ReadMessageHistory
                            deny: String(1n << 11n), // SendMessages
                        },
                    ],
                }),
            })

            // Create maintenance voice channel
            const vcRes = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
                method: "POST",
                headers: {
                    Authorization: `Bot ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: "Maintenance mode VC",
                    type: 2,
                    permission_overwrites: [
                        {
                            id: guildId,
                            type: 0,
                            allow: String(
                                (1n << 10n) | // ViewChannel
                                (1n << 20n) | // Connect
                                (1n << 21n)   // Speak
                            ),
                        },
                    ],
                }),
            })

            // Send maintenance embed in the new chat channel
            if (chatRes.ok) {
                const chatChannel = await chatRes.json()
                await fetch(`${DISCORD_API}/channels/${chatChannel.id}/messages`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bot ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        embeds: [
                            {
                                title: "🛠️ Server Under Maintenance",
                                description:
                                    "This server is currently under maintenance and will return shortly.\n\nPlease be patient while we finish the updates.",
                                color: 0xffa500,
                                fields: [
                                    { name: "🛠️ Status", value: "Maintenance in progress", inline: true },
                                    { name: "⏱️ Expected Duration", value: "Please check back later", inline: true },
                                ],
                                timestamp: new Date().toISOString(),
                            },
                        ],
                    }),
                })
            }

            return NextResponse.json({ success: true, action: "start" })
        }

        if (action === "stop") {
            const maintenanceChat = channels.find((c: any) => c.name === "maintenance-mode-chat")
            const maintenanceVC = channels.find((c: any) => c.name === "Maintenance mode VC")

            if (!maintenanceChat && !maintenanceVC) {
                return NextResponse.json(
                    { error: "Maintenance mode is not active" },
                    { status: 400 }
                )
            }

            // Delete maintenance channels
            if (maintenanceChat) {
                await fetch(`${DISCORD_API}/channels/${maintenanceChat.id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bot ${token}` },
                })
            }
            if (maintenanceVC) {
                await fetch(`${DISCORD_API}/channels/${maintenanceVC.id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bot ${token}` },
                })
            }

            // Unlock all channels by removing @everyone permission overwrite
            const lockableChannels = channels.filter(
                (c: any) =>
                    (c.type === 0 || c.type === 2) &&
                    c.name !== "maintenance-mode-chat" &&
                    c.name !== "Maintenance mode VC"
            )

            for (const ch of lockableChannels) {
                try {
                    await fetch(
                        `${DISCORD_API}/channels/${ch.id}/permissions/${guildId}`,
                        {
                            method: "DELETE",
                            headers: { Authorization: `Bot ${token}` },
                        }
                    )
                } catch (e) {
                    // Continue
                }
            }

            return NextResponse.json({ success: true, action: "stop" })
        }
    } catch (error) {
        console.error("Error managing maintenance mode:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
