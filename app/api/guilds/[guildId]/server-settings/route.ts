import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import { parseBody, pickAllowed, hasMongoOperators } from "@/lib/api-helpers"

// Import all models needed for the dashboard overview
import Guild from "@/lib/models/Guild"
import Welcome from "@/lib/models/Welcome"
import Leave from "@/lib/models/Leave"
import Logging from "@/lib/models/Logging"
import AutoRole from "@/lib/models/AutoRole"
import Verification from "@/lib/models/Verification"

export async function GET(
    request: Request,
    context: { params: Promise<{ guildId: string }> }
) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId } = await context.params

    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        await connectToDatabase()

        // Fetch all module configurations concurrently
        const [
            guild,
            welcome,
            leave,
            logging,
            autorole,
            verification,
        ] = await Promise.all([
            Guild.findOne({ guildId }).lean(),
            Welcome.findOne({ guildId }).lean(),
            Leave.findOne({ guildId }).lean(),
            Logging.findOne({ guildId }).lean(),
            AutoRole.findOne({ guildId }).lean(),
            Verification.findOne({ guildId }).lean(),
        ])

        // Construct a unified response object mapping to the bot's server-settings overview
        const settingsPayload = {
            guildId,
            prefix: guild?.prefix || process.env.PREFIX || '!!',
            botUpdatesChannelId: (guild as any)?.botUpdatesChannelId ?? null,
            disabledChannels: guild?.settings?.disabledChannels || [],
            modules: {
                welcome: welcome || { enabled: false },
                leave: leave || { enabled: false },
                logging: logging || { enabled: false },
                autorole: autorole || { enabled: false },
                verification: verification || { enabled: false }
            }
        }

        return NextResponse.json(settingsPayload)
    } catch (error) {
        console.error("Error fetching aggregate server settings:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(
    request: Request,
    context: { params: Promise<{ guildId: string }> }
) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId } = await context.params

    if (!validateGuildId(guildId)) {
        return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 })
    }

    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const parsed = await parseBody(request)
        if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status })

        if (hasMongoOperators(parsed.data)) {
            return NextResponse.json({ error: "Invalid field values" }, { status: 400 })
        }

        const safe = pickAllowed(parsed.data as Record<string, unknown>, "guild")
        await connectToDatabase()

        const updated = await Guild.findOneAndUpdate(
            { guildId },
            { $set: safe },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean()

        return NextResponse.json({ botUpdatesChannelId: (updated as any)?.botUpdatesChannelId ?? null })
    } catch (error) {
        console.error("Error updating guild settings:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
