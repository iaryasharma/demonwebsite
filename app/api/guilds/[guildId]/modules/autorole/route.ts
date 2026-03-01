import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import AutoRole from "@/lib/models/AutoRole"

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

        let autorole = await AutoRole.findOne({ guildId }).lean()
        if (!autorole) {
            const newAutoRole = new AutoRole({ guildId, enabled: false })
            await newAutoRole.save()
            autorole = newAutoRole.toObject()
        }

        return NextResponse.json(autorole)
    } catch (error) {
        console.error("Error fetching autorole config:", error)
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

        const autorole = await AutoRole.findOneAndUpdate(
            { guildId },
            { $set: body },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean()

        return NextResponse.json(autorole)
    } catch (error) {
        console.error("Error updating autorole config:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
