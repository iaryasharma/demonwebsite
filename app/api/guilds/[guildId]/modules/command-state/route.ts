import { NextResponse } from "next/server"
import { guardGuild } from "@/lib/api-guard"
import { connectToDatabase } from "@/lib/mongodb"
import Guild from "@/lib/models/Guild"
import { parseBody, hasMongoOperators } from "@/lib/api-helpers"

const SNOWFLAKE = /^\d{17,20}$/
const MAX_CHANNELS = 500

export async function GET(request: Request, context: { params: Promise<{ guildId: string }> }) {
    const guard = await guardGuild(request, context.params)
    if (!guard.ok) return guard.response

    try {
        await connectToDatabase()
        const guild = await Guild.findOne({ guildId: guard.guildId }, { settings: 1 }).lean()
        return NextResponse.json({ disabledChannels: guild?.settings?.disabledChannels || [] })
    } catch (error) {
        console.error("[COMMAND_STATE_GET]", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}

export async function POST(request: Request, context: { params: Promise<{ guildId: string }> }) {
    const guard = await guardGuild(request, context.params)
    if (!guard.ok) return guard.response

    try {
        const parsed = await parseBody(request, 32 * 1024)
        if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status })
        if (hasMongoOperators(parsed.data)) return NextResponse.json({ error: "Invalid field values" }, { status: 400 })

        // Only a list of channel IDs is accepted; anything else is rejected instead of being stored
        const { disabledChannels } = parsed.data as { disabledChannels?: unknown }
        if (
            !Array.isArray(disabledChannels) ||
            disabledChannels.length > MAX_CHANNELS ||
            !disabledChannels.every((id) => typeof id === "string" && SNOWFLAKE.test(id))
        ) {
            return NextResponse.json({ error: "disabledChannels must be a list of channel IDs" }, { status: 400 })
        }

        await connectToDatabase()
        const guild = await Guild.findOneAndUpdate(
            { guildId: guard.guildId },
            { $set: { "settings.disabledChannels": [...new Set(disabledChannels as string[])] } },
            { new: true, upsert: true, projection: { settings: 1 } }
        ).lean()

        return NextResponse.json({ disabledChannels: guild?.settings?.disabledChannels || [] })
    } catch (error) {
        console.error("[COMMAND_STATE_POST]", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
