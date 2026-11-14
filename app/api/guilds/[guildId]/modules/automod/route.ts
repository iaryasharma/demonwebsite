import { NextResponse } from "next/server"
import { guardGuild } from "@/lib/api-guard"
import { connectToDatabase } from "@/lib/mongodb"
import AutoMod from "@/lib/models/AutoMod"
import { parseBody, hasMongoOperators } from "@/lib/api-helpers"
import { validateAutoMod } from "@/lib/module-validation"
import { syncNativeRules, type AutoModSettings } from "@/lib/automod-native"

// Word lists can hold up to 5000 entries of 60 characters, so this route accepts a larger body than the default
const MAX_AUTOMOD_BODY = 400 * 1024

export async function GET(request: Request, context: { params: Promise<{ guildId: string }> }) {
    const guard = await guardGuild(request, context.params)
    if (!guard.ok) return guard.response

    try {
        await connectToDatabase()
        const config = await AutoMod.findOneAndUpdate(
            { guildId: guard.guildId },
            { $setOnInsert: { guildId: guard.guildId } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        // toObject() (not .lean()) so settings saved by an older version still get every newer default
        return NextResponse.json(config?.toObject())
    } catch (error) {
        console.error("Error fetching AutoMod config:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

/**
 * Saves the settings, then mirrors them into Discord's built-in AutoMod. If Discord rejects the sync
 * (usually the bot is missing Manage Server) the settings are still saved and the bot enforces them itself.
 */
export async function POST(request: Request, context: { params: Promise<{ guildId: string }> }) {
    const guard = await guardGuild(request, context.params)
    if (!guard.ok) return guard.response

    try {
        const parsed = await parseBody(request, MAX_AUTOMOD_BODY)
        if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status })
        if (hasMongoOperators(parsed.data)) return NextResponse.json({ error: "Invalid field values" }, { status: 400 })

        const valid = validateAutoMod(parsed.data)
        if (!valid.ok) return NextResponse.json({ error: valid.error }, { status: 400 })

        await connectToDatabase()
        const saved = await AutoMod.findOneAndUpdate(
            { guildId: guard.guildId },
            { $set: valid.data },
            { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
        )
        const settings = saved?.toObject() as (AutoModSettings & { nativeSynced: boolean }) | undefined
        if (!settings) return NextResponse.json({ error: "Internal server error" }, { status: 500 })

        const native = await syncNativeRules(guard.guildId, settings)
        const config = await AutoMod.findOneAndUpdate(
            { guildId: guard.guildId },
            { $set: { nativeSynced: native.ok && Boolean(settings.enabled) } },
            { new: true }
        )

        return NextResponse.json({
            config: config?.toObject(),
            native: native.ok
                ? { ok: true, created: native.created, updated: native.updated, removed: native.removed }
                : { ok: false, reason: native.error === "missing_permission" ? "missing_permission" : "sync_failed" },
        })
    } catch (error) {
        console.error("Error saving AutoMod config:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
