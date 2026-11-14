import { NextResponse } from "next/server"
import { guardGuild } from "@/lib/api-guard"
import { connectToDatabase } from "@/lib/mongodb"
import RaidProtection from "@/lib/models/RaidProtection"
import { parseBody, hasMongoOperators } from "@/lib/api-helpers"
import { validateRaid } from "@/lib/module-validation"

export async function GET(request: Request, context: { params: Promise<{ guildId: string }> }) {
    const guard = await guardGuild(request, context.params)
    if (!guard.ok) return guard.response

    try {
        await connectToDatabase()
        const config = await RaidProtection.findOneAndUpdate(
            { guildId: guard.guildId },
            { $setOnInsert: { guildId: guard.guildId } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        return NextResponse.json(config?.toObject())
    } catch (error) {
        console.error("Error fetching raid protection config:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: Request, context: { params: Promise<{ guildId: string }> }) {
    const guard = await guardGuild(request, context.params)
    if (!guard.ok) return guard.response

    try {
        const parsed = await parseBody(request)
        if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status })
        if (hasMongoOperators(parsed.data)) return NextResponse.json({ error: "Invalid field values" }, { status: 400 })

        const valid = validateRaid(parsed.data)
        if (!valid.ok) return NextResponse.json({ error: valid.error }, { status: 400 })

        await connectToDatabase()
        const config = await RaidProtection.findOneAndUpdate(
            { guildId: guard.guildId },
            { $set: valid.data },
            { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
        )
        return NextResponse.json(config?.toObject())
    } catch (error) {
        console.error("Error saving raid protection config:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
