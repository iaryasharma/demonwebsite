import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"

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
