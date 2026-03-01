import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import Guild from "@/lib/models/Guild"

const DISCORD_WEBHOOK_REGEX = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/.+$/

interface StoredWebhook {
    name: string
    url: string
    avatarUrl: string | null
    createdAt: Date
}

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

    try {
        await connectToDatabase()
        const guild = await Guild.findOne({ guildId })
        return NextResponse.json(guild?.webhooks || [])
    } catch (error) {
        console.error("Error fetching webhooks:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
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

    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const { url } = await request.json()

        if (!url) {
            return NextResponse.json({ error: "Webhook URL is required" }, { status: 400 })
        }

        if (!DISCORD_WEBHOOK_REGEX.test(url)) {
            return NextResponse.json({ error: "Invalid Discord webhook URL" }, { status: 400 })
        }

        // Fetch the webhook info from Discord to get real name + avatar
        let name = "Webhook"
        let avatarUrl: string | null = null
        try {
            const whRes = await fetch(url)
            if (whRes.ok) {
                const whData = await whRes.json()
                if (whData.name) name = whData.name
                if (whData.avatar && whData.id) {
                    avatarUrl = `https://cdn.discordapp.com/avatars/${whData.id}/${whData.avatar}.png`
                }
            }
        } catch {
            // Non-fatal — fall back to generic name
        }

        await connectToDatabase()

        const guild = await Guild.findOneAndUpdate(
            { guildId },
            {
                $push: {
                    webhooks: { name, url, avatarUrl, createdAt: new Date() },
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        return NextResponse.json(guild.webhooks)
    } catch (error) {
        console.error("Error adding webhook:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(
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

    try {
        const { url } = await request.json()

        await connectToDatabase()

        await Guild.findOneAndUpdate(
            { guildId },
            { $pull: { webhooks: { url } } }
        )

        const guild = await Guild.findOne({ guildId })
        return NextResponse.json(guild?.webhooks || [])
    } catch (error) {
        console.error("Error deleting webhook:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
