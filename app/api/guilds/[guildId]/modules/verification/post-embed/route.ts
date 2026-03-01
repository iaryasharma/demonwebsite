import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import Verification from "@/lib/models/Verification"

const DISCORD_API = "https://discord.com/api/v10"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ guildId: string }> }
) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { guildId } = await params

    if (!validateGuildId(guildId)) return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 })

    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const token = process.env.DISCORD_BOT_TOKEN
    if (!token) return NextResponse.json({ error: "Bot token not configured" }, { status: 500 })

    try {
        await connectToDatabase()

        const config = await Verification.findOne({ guildId }).lean() as any
        if (!config) return NextResponse.json({ error: "Verification not configured" }, { status: 404 })
        if (!config.channelId) return NextResponse.json({ error: "No verification channel configured" }, { status: 400 })
        if (!config.roleId) return NextResponse.json({ error: "No verified role configured" }, { status: 400 })

        // Fetch guild to get icon for thumbnail
        const guildRes = await fetch(`${DISCORD_API}/guilds/${guildId}`, {
            headers: { Authorization: `Bot ${token}` },
        })
        const guild = guildRes.ok ? await guildRes.json() : null
        const iconUrl = guild?.icon
            ? `https://cdn.discordapp.com/icons/${guildId}/${guild.icon}.${guild.icon.startsWith("a_") ? "gif" : "webp"}?size=256`
            : null

        // Default description per verification type
        const verifyType: string = config.type ?? "button"
        let defaultDesc: string
        if (verifyType === "captcha") {
            defaultDesc = "Click the button below to receive a CAPTCHA image. Solve it to gain access to the server!"
        } else if (verifyType === "code") {
            defaultDesc = "Click the button below to receive your personal verification code."
        } else {
            defaultDesc = "Click the button below to verify yourself and gain access to the server!"
        }

        // Build embed
        const embed: Record<string, unknown> = {
            color: parseInt((config.embedColor || "#57F287").replace("#", ""), 16),
            title: config.embedTitle || "✅ Server Verification",
            description: config.embedDescription || defaultDesc,
        }
        if (iconUrl) embed.thumbnail = { url: iconUrl }

        // Button component (matches bot's verify_button customId)
        const components = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        custom_id: "verify_button",
                        label: config.buttonLabel || "Verify",
                        style: 3, // Success (green)
                    },
                ],
            },
        ]

        // Delete old verification message if it exists
        if (config.messageId) {
            await fetch(
                `${DISCORD_API}/channels/${config.channelId}/messages/${config.messageId}`,
                { method: "DELETE", headers: { Authorization: `Bot ${token}` } }
            ).catch(() => {})
        }

        // Post the new embed
        const postRes = await fetch(`${DISCORD_API}/channels/${config.channelId}/messages`, {
            method: "POST",
            headers: {
                Authorization: `Bot ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ embeds: [embed], components }),
        })

        if (!postRes.ok) {
            const err = await postRes.json().catch(() => ({}))
            const msg = (err as any)?.message ?? String(postRes.status)
            return NextResponse.json({ error: `Discord error: ${msg}` }, { status: 502 })
        }

        const posted = await postRes.json()

        // Persist the new message ID so future re-posts delete the old one
        await Verification.updateOne({ guildId }, { $set: { messageId: posted.id } })

        return NextResponse.json({ ok: true, messageId: posted.id })
    } catch (error) {
        console.error("Error posting verification embed:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
