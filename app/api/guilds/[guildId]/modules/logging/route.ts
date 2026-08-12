import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import Logging from "@/lib/models/Logging"
import { parseBody, pickAllowed, hasMongoOperators } from "@/lib/api-helpers"

function stripSecrets(doc: Record<string, unknown>) {
    delete doc.loggingWebhookId
    delete doc.loggingWebhookToken
    delete doc.loggingWebhookIv
    delete doc.loggingWebhookChannelId
    delete doc.__v
    return doc
}

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

        let doc = await Logging.findOne({ guildId })
        if (!doc) {
            doc = new Logging({ guildId, enabled: false })
            await doc.save()
        }

        // Match bot: map legacy global mode → per-category routing once
        if (!doc.categoryRoutingMigrated && typeof doc.ensureCategoryRouting === "function") {
            await doc.ensureCategoryRouting()
        }

        const withDefaults = stripSecrets(new Logging(doc.toObject()).toObject() as Record<string, unknown>)
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

        const safe = pickAllowed(parsed.data as Record<string, unknown>, "logging") as Record<string, unknown>

        // Dashboard always writes the migrated routing model
        safe.categoryRoutingMigrated = true
        if (typeof safe.fallbackOnly !== "boolean") {
            safe.fallbackOnly = false
        }

        await connectToDatabase()

        const logging = await Logging.findOneAndUpdate(
            { guildId },
            { $set: safe },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean()

        if (safe.channels && (safe.channels as { security?: string | null }).security) {
            const channelId = (safe.channels as { security: string }).security

            await Logging.findOneAndUpdate(
                { guildId },
                { $set: { "eventChannels.securityViolation": channelId } }
            )

            const SecurityConfig = (await import("@/lib/models/SecurityConfig")).default
            await SecurityConfig.findOneAndUpdate(
                { guildId },
                { $set: { securityLogChannelId: channelId } },
                { upsert: true }
            )
        }

        return NextResponse.json(stripSecrets({ ...(logging as object) } as Record<string, unknown>))
    } catch (error) {
        console.error("Error updating logging config:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
