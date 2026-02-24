import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Guild } from "@/lib/models/Guild"

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

        // Find or create guild doc
        let guild = await Guild.findOne({ guildId })
        if (!guild) {
            guild = await Guild.create({ guildId, prefix: "!!", settings: {} })
        }

        return NextResponse.json({
            guildId: guild.guildId,
            prefix: guild.prefix,
            settings: guild.settings,
        })
    } catch (error) {
        console.error("Error fetching guild settings:", error)
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
        const body = await request.json()
        const { prefix, settings } = body

        await connectToDatabase()

        const updateData: any = {}
        if (prefix !== undefined) updateData.prefix = prefix
        if (settings !== undefined) {
            // Merge settings rather than overwrite
            const existing = await Guild.findOne({ guildId })
            updateData.settings = { ...(existing?.settings || {}), ...settings }
        }

        const guild = await Guild.findOneAndUpdate(
            { guildId },
            { $set: updateData },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        return NextResponse.json({
            guildId: guild.guildId,
            prefix: guild.prefix,
            settings: guild.settings,
        })
    } catch (error) {
        console.error("Error updating guild settings:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
