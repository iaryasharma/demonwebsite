import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Guild } from "@/lib/models/Guild"

const DISCORD_WEBHOOK_REGEX = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/.+$/

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ guildId: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId } = await params

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
    const session = await getServerSession(authOptions)
    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId } = await params

    try {
        const { name, url } = await request.json()

        if (!name || !url) {
            return NextResponse.json({ error: "Name and URL are required" }, { status: 400 })
        }

        if (!DISCORD_WEBHOOK_REGEX.test(url)) {
            return NextResponse.json({ error: "Invalid Discord webhook URL" }, { status: 400 })
        }

        await connectToDatabase()

        const guild = await Guild.findOneAndUpdate(
            { guildId },
            {
                $push: {
                    webhooks: { name, url, createdAt: new Date() },
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
    const session = await getServerSession(authOptions)
    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId } = await params

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
