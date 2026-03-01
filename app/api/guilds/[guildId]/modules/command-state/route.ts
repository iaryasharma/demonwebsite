import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Guild from "@/lib/models/Guild"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ guildId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!(session?.user as any)?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { guildId } = await props.params

        if (!validateGuildId(guildId)) {
            return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 })
        }

        const accessToken = await getAccessTokenFromRequest(req)
        if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const hasPermission = await requireManageGuild(accessToken, guildId)
        if (!hasPermission) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        await connectToDatabase()

        let guild = await Guild.findOne({ guildId })
        if (!guild) {
            guild = await Guild.create({ guildId })
        }

        return NextResponse.json({
            disabledChannels: guild.settings?.disabledChannels || []
        })
    } catch (error) {
        console.error("[COMMAND_STATE_GET]", error)
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

        if (!validateGuildId(guildId)) {
            return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 })
        }

        const accessToken = await getAccessTokenFromRequest(req)
        if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const hasPermission = await requireManageGuild(accessToken, guildId)
        if (!hasPermission) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const { disabledChannels } = await req.json()
        if (!Array.isArray(disabledChannels)) {
            return NextResponse.json({ error: "Invalid array" }, { status: 400 })
        }

        await connectToDatabase()

        const guild = await Guild.findOneAndUpdate(
            { guildId },
            { $set: { "settings.disabledChannels": disabledChannels } },
            { new: true, upsert: true }
        )

        return NextResponse.json({ disabledChannels: guild.settings?.disabledChannels || [] })
    } catch (error) {
        console.error("[COMMAND_STATE_POST]", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
