import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import Logging from "@/lib/models/Logging"

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

        let logging = await Logging.findOne({ guildId }).lean()
        if (!logging) {
            const newLogging = new Logging({ guildId, enabled: false })
            await newLogging.save()
            logging = newLogging.toObject()
        }

        return NextResponse.json(logging)
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

    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const body = await request.json()
        await connectToDatabase()

        // Strip out read-only fields
        delete body._id
        delete body.__v
        delete body.guildId

        const logging = await Logging.findOneAndUpdate(
            { guildId },
            { $set: body },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean()

        return NextResponse.json(logging)
    } catch (error) {
        console.error("Error updating logging config:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
