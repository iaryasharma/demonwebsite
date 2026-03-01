import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import Verification from "@/lib/models/Verification"
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

        const safe = pickAllowed(parsed.data as Record<string, unknown>, "verification")
        await connectToDatabase()

        const verification = await Verification.findOneAndUpdate(
            { guildId },
            { $set: safe },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean()

        return NextResponse.json(verification)
    } catch (error) {
        console.error("Error updating verification config:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
