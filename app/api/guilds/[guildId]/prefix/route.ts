import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Guild from "@/lib/models/Guild"
import { getAccessTokenFromRequest, requireManageGuild } from "@/lib/permissions"

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ guildId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!(session?.user as any)?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { guildId } = await props.params
        const accessToken = await getAccessTokenFromRequest(req)
        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const hasPermission = await requireManageGuild(accessToken, guildId)

        if (!hasPermission) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await connectToDatabase()

        let guild = await Guild.findOne({ guildId })
        if (!guild) {
            guild = await Guild.create({ guildId, prefix: "!!" })
        }

        return NextResponse.json({ prefix: guild.prefix })
    } catch (error) {
        console.error("[PREFIX_GET]", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ guildId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!(session?.user as any)?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { guildId } = await props.params

        const accessToken = await getAccessTokenFromRequest(req)
        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const hasPermission = await requireManageGuild(accessToken, guildId)

        if (!hasPermission) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { prefix } = body

        if (!prefix || prefix.length > 5) {
            return NextResponse.json({ error: "Invalid prefix length (max 5)" }, { status: 400 })
        }

        await connectToDatabase()

        const guild = await Guild.findOneAndUpdate(
            { guildId },
            { $set: { prefix } },
            { new: true, upsert: true }
        )

        return NextResponse.json({ prefix: guild.prefix })
    } catch (error) {
        console.error("[PREFIX_POST]", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
