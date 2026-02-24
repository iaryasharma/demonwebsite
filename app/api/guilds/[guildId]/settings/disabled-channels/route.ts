import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import { Guild } from "@/lib/models/Guild"

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
        const disabledChannels = guild?.settings?.disabledChannels || []
        return NextResponse.json({ disabledChannels })
    } catch (error) {
        console.error("Error fetching disabled channels:", error)
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
        const body = await request.json()
        const { channelId, action } = body

        if (!channelId || !["enable", "disable"].includes(action)) {
            return NextResponse.json(
                { error: "channelId and action (enable|disable) are required" },
                { status: 400 }
            )
        }

        await connectToDatabase()

        let guild = await Guild.findOne({ guildId })
        if (!guild) {
            guild = await Guild.create({ guildId, prefix: "!!", settings: {} })
        }

        if (!guild.settings) guild.settings = {}
        if (!guild.settings.disabledChannels) guild.settings.disabledChannels = []

        if (action === "disable") {
            if (!guild.settings.disabledChannels.includes(channelId)) {
                guild.settings.disabledChannels.push(channelId)
            }
        } else {
            guild.settings.disabledChannels = guild.settings.disabledChannels.filter(
                (id: string) => id !== channelId
            )
        }

        guild.markModified("settings")
        await guild.save()

        return NextResponse.json({ disabledChannels: guild.settings.disabledChannels })
    } catch (error) {
        console.error("Error updating disabled channels:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
