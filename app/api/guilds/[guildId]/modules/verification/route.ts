import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
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

        let verification = await Verification.findOne({ guildId }).lean()
        if (!verification) {
            const newVerification = new Verification({ guildId, enabled: false })
            await newVerification.save()
            verification = newVerification.toObject()
        }

        return NextResponse.json(verification)
    } catch (error) {
        console.error("Error fetching verification config:", error)
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

        const verification = await Verification.findOneAndUpdate(
            { guildId },
            { $set: body },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean()

        return NextResponse.json(verification)
    } catch (error) {
        console.error("Error updating verification config:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
