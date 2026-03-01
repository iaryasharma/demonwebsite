import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import Welcome from "@/lib/models/Welcome"

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

        let welcome = await Welcome.findOne({ guildId }).lean()
        if (!welcome) {
            welcome = await Welcome.create({ guildId, enabled: false })
            welcome = welcome.toObject()
        }

        return NextResponse.json(welcome)
    } catch (error) {
        console.error("Error fetching welcome config:", error)
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

        // Strip out any _id, __v, or guildId that might come from the client to prevent updates to unallowed fields
        delete body._id
        delete body.__v
        delete body.guildId

        const welcome = await Welcome.findOneAndUpdate(
            { guildId },
            { $set: body },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean()

        return NextResponse.json(welcome)
    } catch (error) {
        console.error("Error updating welcome config:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
