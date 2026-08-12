import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import SecurityConfig, { PUNISHMENT_TYPES } from "@/lib/models/SecurityConfig"
import { parseBody, pickAllowed, hasMongoOperators } from "@/lib/api-helpers"

type PunishmentValue = (typeof PUNISHMENT_TYPES)[number]

function normalizePunishmentType(raw: unknown): PunishmentValue {
  if (raw === "removeRoles") return "quarantine"
  if (raw === "kick" || raw === "ban" || raw === "quarantine") return raw
  return "ban"
}

function normalizeEventPunishments(raw: unknown) {
  const keys = [
    "channelCreate",
    "channelDelete",
    "roleCreate",
    "roleDelete",
    "memberKick",
    "memberBan",
    "prune",
    "botAdd",
    "dangerousRoleGrant",
  ] as const
  const src = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const out: Record<string, PunishmentValue | null> = {}
  for (const key of keys) {
    const v = src[key]
    if (v == null || v === "" || v === "inherit") {
      out[key] = null
    } else if (v === "removeRoles") {
      out[key] = "quarantine"
    } else if (v === "kick" || v === "ban" || v === "quarantine") {
      out[key] = v
    } else {
      out[key] = null
    }
  }
  return out
}

function toClientConfig(doc: Record<string, unknown>) {
  const punishment = (doc.punishment && typeof doc.punishment === "object"
    ? doc.punishment
    : {}) as Record<string, unknown>

  return {
    ...doc,
    dryRun: Boolean(doc.dryRun),
    quarantineRoleId: (doc.quarantineRoleId as string | null) ?? null,
    punishment: {
      type: normalizePunishmentType(punishment.type),
      rolesToRemove: Array.isArray(punishment.rolesToRemove) ? punishment.rolesToRemove : [],
    },
    eventPunishments: normalizeEventPunishments(doc.eventPunishments),
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const accessToken = await getAccessTokenFromRequest(request)
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { guildId } = await params
  if (!validateGuildId(guildId)) {
    return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 })
  }
  if (!(await requireManageGuild(accessToken, guildId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    await connectToDatabase()

    let config = await SecurityConfig.findOne({ guildId })
    if (!config) {
      config = await SecurityConfig.create({ guildId })
    }

    const withDefaults = new SecurityConfig(config.toObject()).toObject() as Record<string, unknown>
    return NextResponse.json(toClientConfig(withDefaults))
  } catch (error) {
    console.error("Error fetching security config:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const accessToken = await getAccessTokenFromRequest(request)
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { guildId } = await params
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

    const safe = pickAllowed(parsed.data as Record<string, unknown>, "security_config") as Record<string, unknown>

    if (safe.punishment && typeof safe.punishment === "object") {
      const p = safe.punishment as Record<string, unknown>
      safe.punishment = {
        type: normalizePunishmentType(p.type),
        rolesToRemove: Array.isArray(p.rolesToRemove) ? p.rolesToRemove : [],
      }
    }

    if ("eventPunishments" in safe) {
      safe.eventPunishments = normalizeEventPunishments(safe.eventPunishments)
    }

    if ("dryRun" in safe) safe.dryRun = Boolean(safe.dryRun)
    if ("quarantineRoleId" in safe) {
      safe.quarantineRoleId = safe.quarantineRoleId || null
    }

    await connectToDatabase()

    const config = await SecurityConfig.findOneAndUpdate(
      { guildId },
      { $set: safe },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    if (safe.securityLogChannelId) {
      const Logging = (await import("@/lib/models/Logging")).default
      await Logging.findOneAndUpdate(
        { guildId },
        {
          $set: {
            "channels.security": safe.securityLogChannelId,
            "eventChannels.securityViolation": safe.securityLogChannelId,
          },
        },
        { upsert: true }
      )
    }

    const obj = new SecurityConfig(config.toObject()).toObject() as Record<string, unknown>
    return NextResponse.json(toClientConfig(obj))
  } catch (error) {
    console.error("Error updating security config:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
