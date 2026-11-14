import { NextResponse } from "next/server"
import { guardGuild } from "@/lib/api-guard"
import { connectToDatabase } from "@/lib/mongodb"
import Guild from "@/lib/models/Guild"
import { parseBody, hasMongoOperators } from "@/lib/api-helpers"
import { validateCommandToggle } from "@/lib/module-validation"
import catalogData from "@/json/commands_list.json"

// Must match demon-v5/utils/commandToggle.js
const PROTECTED_COMMANDS = new Set(["help"])
const PROTECTED_CATEGORIES = new Set(["developer"])

const commands = (catalogData as { commands: { name: string; category: string; developerOnly?: boolean }[] }).commands
const CATALOG = {
    commands: new Set(commands.map((c) => c.name)),
    categories: new Set(commands.map((c) => c.category.toLowerCase())),
    protectedCommands: PROTECTED_COMMANDS,
    protectedCategories: PROTECTED_CATEGORIES,
}

function pick(settings: Record<string, unknown> | undefined) {
    return {
        disabledCommands: Array.isArray(settings?.disabledCommands) ? settings!.disabledCommands : [],
        disabledCategories: Array.isArray(settings?.disabledCategories) ? settings!.disabledCategories : [],
    }
}

export async function GET(request: Request, context: { params: Promise<{ guildId: string }> }) {
    const guard = await guardGuild(request, context.params)
    if (!guard.ok) return guard.response

    try {
        await connectToDatabase()
        const guild = await Guild.findOne({ guildId: guard.guildId }, { settings: 1 }).lean()
        return NextResponse.json(pick(guild?.settings))
    } catch (error) {
        console.error("Error fetching command switches:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: Request, context: { params: Promise<{ guildId: string }> }) {
    const guard = await guardGuild(request, context.params)
    if (!guard.ok) return guard.response

    try {
        const parsed = await parseBody(request, 32 * 1024)
        if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status })
        if (hasMongoOperators(parsed.data)) return NextResponse.json({ error: "Invalid field values" }, { status: 400 })

        const valid = validateCommandToggle(parsed.data, CATALOG)
        if (!valid.ok) return NextResponse.json({ error: valid.error }, { status: 400 })

        const update: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(valid.data)) update[`settings.${key}`] = value

        await connectToDatabase()
        const guild = await Guild.findOneAndUpdate(
            { guildId: guard.guildId },
            { $set: update },
            { upsert: true, new: true, setDefaultsOnInsert: true, projection: { settings: 1 } }
        ).lean()
        return NextResponse.json(pick(guild?.settings))
    } catch (error) {
        console.error("Error saving command switches:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
