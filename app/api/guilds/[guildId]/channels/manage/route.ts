import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"

const DISCORD_API = "https://discord.com/api/v10"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ guildId: string }> }
) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId } = await params

    if (!validateGuildId(guildId)) {
        return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 })
    }

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
        const body = await request.json()
        const { channelId, action, duration } = body

        // Validate channelId is a Discord snowflake — prevents SSRF via crafted URL segments
        if (!channelId || !validateGuildId(channelId)) {
            return NextResponse.json(
                { error: "Invalid channelId" },
                { status: 400 }
            )
        }

        if (!["lock", "unlock", "slowmode"].includes(action)) {
            return NextResponse.json(
                { error: "channelId and action (lock|unlock|slowmode) are required" },
                { status: 400 }
            )
        }

        if (action === "lock" || action === "unlock") {
            // Get the guild's @everyone role (same ID as guild)
            const everyoneRoleId = guildId

            // Build permission overwrite payload
            const denyBits = "0x4001800000840"
            const payload: any = {
                id: everyoneRoleId,
                type: 0, // role overwrite
            }

            if (action === "lock") {
                payload.deny = denyBits
                payload.allow = "0"
            } else {
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
                console.error(`Failed to ${action} channel:`, await res.text().catch(() => ""))
                return NextResponse.json(
                    { error: `Failed to ${action} channel` },
                    { status: res.status }
                )
            }

            return NextResponse.json({ success: true, action, channelId })
        }

        if (action === "slowmode") {
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
                console.error("Failed to set slowmode:", await res.text().catch(() => ""))
                return NextResponse.json(
                    { error: "Failed to set slowmode" },
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
