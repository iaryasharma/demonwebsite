import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import Logging from "@/lib/models/Logging"
import { parseBody, pickAllowed, hasMongoOperators } from "@/lib/api-helpers"

export async function GET(
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
        await connectToDatabase()

        let logging = await Logging.findOne({ guildId }).lean()
        if (!logging) {
            const newLogging = new Logging({ guildId, enabled: false })
            await newLogging.save()
            logging = newLogging.toObject()
        }

        // Merge schema defaults for any fields missing from older documents
        // (e.g. fields added after the document was first created)
        const withDefaults = new Logging(logging).toObject()

        return NextResponse.json(withDefaults)
    } catch (error) {
        console.error("Error fetching logging config:", error)
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

        const safe = pickAllowed(parsed.data as Record<string, unknown>, "logging")
        await connectToDatabase()

        const logging = await Logging.findOneAndUpdate(
            { guildId },
            { $set: safe },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean()

        return NextResponse.json(logging)
    } catch (error) {
        console.error("Error updating logging config:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
