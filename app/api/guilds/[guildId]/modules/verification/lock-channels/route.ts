import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"

const DISCORD_API = "https://discord.com/api/v10"

// Thread channel types — these don't support permission overwrites
const THREAD_TYPES = new Set([10, 11, 12])

// Permission bit constants (BigInt because USE_APPLICATION_COMMANDS > 2^31)
const PERM = {
    VIEW_CHANNEL:             BigInt("1024"),
    READ_MESSAGE_HISTORY:     BigInt("65536"),
    SEND_MESSAGES:            BigInt("2048"),
    ADD_REACTIONS:            BigInt("64"),
    USE_APPLICATION_COMMANDS: BigInt("2147483648"),
}

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
        return NextResponse.json({ error: "Bot token not configured" }, { status: 500 })
    }

    let body: { unverifiedRoleId?: string; verifyChannelId?: string; oldUnverifiedRoleId?: string }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const { unverifiedRoleId, verifyChannelId, oldUnverifiedRoleId } = body

    if (!unverifiedRoleId || !validateGuildId(unverifiedRoleId)) {
        return NextResponse.json({ error: "unverifiedRoleId is required and must be a valid Discord snowflake" }, { status: 400 })
    }
    if (!verifyChannelId || !validateGuildId(verifyChannelId)) {
        return NextResponse.json({ error: "verifyChannelId is required and must be a valid Discord snowflake" }, { status: 400 })
    }

    try {
        // Fetch all guild channels
        const channelsRes = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
            headers: { Authorization: `Bot ${token}` },
        })
        if (!channelsRes.ok) {
            return NextResponse.json({ error: "Failed to fetch guild channels from Discord" }, { status: 502 })
        }
        const allChannels: Array<{ id: string; type: number }> = await channelsRes.json()

        // Filter out threads
        const targetChannels = allChannels.filter(ch => !THREAD_TYPES.has(ch.type))

        const results = { locked: 0, failed: 0, cleaned: 0 }

        // Step 1: Clean old unverified role's overwrites if role changed
        if (oldUnverifiedRoleId && oldUnverifiedRoleId !== unverifiedRoleId && validateGuildId(oldUnverifiedRoleId)) {
            const cleanResults = await Promise.allSettled(
                targetChannels.map(ch =>
                    fetch(`${DISCORD_API}/channels/${ch.id}/permissions/${oldUnverifiedRoleId}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bot ${token}` },
                    }).then(r => {
                        if (!r.ok && r.status !== 404) throw new Error(`${r.status}`)
                    })
                )
            )
            results.cleaned = cleanResults.filter(r => r.status === "fulfilled").length
        }

        // Step 2: Apply restrictions for the new unverified role
        const applyResults = await Promise.allSettled(
            targetChannels.map(ch => {
                let allow: bigint
                let deny: bigint

                if (ch.id === verifyChannelId) {
                    // Verify channel: visible but read-only (can see embed + click button)
                    allow = PERM.VIEW_CHANNEL | PERM.READ_MESSAGE_HISTORY
                    deny  = PERM.SEND_MESSAGES | PERM.ADD_REACTIONS | PERM.USE_APPLICATION_COMMANDS
                } else {
                    // All other channels: completely hidden
                    allow = BigInt(0)
                    deny  = PERM.VIEW_CHANNEL
                }

                return fetch(`${DISCORD_API}/channels/${ch.id}/permissions/${unverifiedRoleId}`, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bot ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id:    unverifiedRoleId,
                        type:  0, // role overwrite
                        allow: allow.toString(),
                        deny:  deny.toString(),
                    }),
                }).then(r => {
                    if (!r.ok) throw new Error(`Channel ${ch.id}: ${r.status}`)
                })
            })
        )

        results.locked = applyResults.filter(r => r.status === "fulfilled").length
        results.failed = applyResults.filter(r => r.status === "rejected").length

        return NextResponse.json({
            ok: true,
            results,
            message: `Channel restrictions applied to ${results.locked} channel${results.locked !== 1 ? "s" : ""}${results.failed > 0 ? ` (${results.failed} failed — check bot permissions)` : ""}.`,
        })
    } catch (error) {
        console.error("Error applying verification channel locks:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
