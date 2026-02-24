import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const DISCORD_API = "https://discord.com/api/v10"

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
        return NextResponse.json(
            { error: "Bot token not configured" },
            { status: 500 }
        )
    }

    try {
        const body = await request.json()
        const { channelId, action, duration } = body

        if (!channelId || !["lock", "unlock", "slowmode"].includes(action)) {
            return NextResponse.json(
                { error: "channelId and action (lock|unlock|slowmode) are required" },
                { status: 400 }
            )
        }

        if (action === "lock" || action === "unlock") {
            // Get the guild's @everyone role (same ID as guild)
            const everyoneRoleId = guildId

            // Build permission overwrite payload
            // SendMessages = 0x800, AddReactions = 0x40, CreatePublicThreads = 0x800000000
            // CreatePrivateThreads = 0x1000000000, SendMessagesInThreads = 0x4000000000
            const denyBits = "0x4001800000840"
            const payload: any = {
                id: everyoneRoleId,
                type: 0, // role overwrite
            }

            if (action === "lock") {
                payload.deny = denyBits
                payload.allow = "0"
            } else {
                // Unlock: remove the deny bits
                payload.deny = "0"
                payload.allow = "0"
            }

            const res = await fetch(
                `${DISCORD_API}/channels/${channelId}/permissions/${everyoneRoleId}`,
                {
                    method: action === "unlock" ? "DELETE" : "PUT",
                    headers: {
                        Authorization: `Bot ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: action === "unlock" ? undefined : JSON.stringify(payload),
                }
            )

            if (!res.ok && res.status !== 204) {
                const errorData = await res.json().catch(() => ({}))
                return NextResponse.json(
                    { error: `Failed to ${action} channel`, details: errorData },
                    { status: res.status }
                )
            }

            return NextResponse.json({ success: true, action, channelId })
        }

        if (action === "slowmode") {
            // duration in seconds (0 = off, max 21600 = 6h)
            const seconds = Math.min(Math.max(0, parseInt(duration) || 0), 21600)

            const res = await fetch(`${DISCORD_API}/channels/${channelId}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bot ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ rate_limit_per_user: seconds }),
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                return NextResponse.json(
                    { error: "Failed to set slowmode", details: errorData },
                    { status: res.status }
                )
            }

            const updated = await res.json()
            return NextResponse.json({
                success: true,
                action: "slowmode",
                channelId,
                rateLimitPerUser: updated.rate_limit_per_user,
            })
        }
    } catch (error) {
        console.error("Error managing channel:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
