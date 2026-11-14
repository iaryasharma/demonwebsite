/**
 * Mirrors the AutoMod settings into Discord's built-in AutoMod rules (REST, server side only), the same way
 * the bot's /automod command does. Rules are named "Demon: ..." and only rules created by this bot are touched.
 * Needs the bot to have Manage Server. Discord limits: 6 keyword rules, 1 spam, 1 preset, 1 mention-spam per
 * server; 1000 keywords and 10 regexes per rule.
 */
import { getBotUser } from "@/lib/discord"

const DISCORD_API = "https://discord.com/api/v10"
const MAX_KEYWORD_SHARDS = 4
const WORDS_PER_RULE = 1000
const BLOCK_MESSAGE = "This message was blocked by AutoMod."
const INVITE_REGEX = "(?i)(?:discord(?:app)?\\.com/invite|discord\\.gg|discord\\.me)/[\\w-]+"
const LINK_REGEX = "(?i)https?://\\S+"

// Discord trigger types
const KEYWORD = 1
const SPAM = 3
const KEYWORD_PRESET = 4
const MENTION_SPAM = 5

export interface AutoModSettings {
    enabled: boolean
    blockedWords: string[]
    blockInvites: boolean
    blockLinks: boolean
    regexPatterns: string[]
    presets: number[]
    maxMentions: number
    raidProtection: boolean
    antiSpam: boolean
    ignoredChannels: string[]
    ignoredRoles: string[]
    allowedDomains: string[]
}

export interface NativeSyncResult {
    ok: boolean
    created: number
    updated: number
    removed: number
    error?: string
}

const shardName = (i: number) => (i === 0 ? "Demon: blocked words" : `Demon: blocked words ${i + 1}`)

function headers() {
    const raw = process.env.DISCORD_BOT_TOKEN
    if (!raw) throw new Error("DISCORD_BOT_TOKEN is not configured")
    return {
        Authorization: `Bot ${raw.startsWith("Bot ") ? raw.slice(4) : raw}`,
        "Content-Type": "application/json",
        "X-Audit-Log-Reason": encodeURIComponent("Demon AutoMod sync"),
    }
}

async function discord(path: string, init: RequestInit = {}) {
    const res = await fetch(`${DISCORD_API}${path}`, { ...init, headers: headers(), cache: "no-store" })
    if (!res.ok) {
        // Never echo Discord's response body to the caller; keep the status only
        throw new Error(res.status === 403 ? "missing_permission" : `discord_${res.status}`)
    }
    return res.status === 204 ? null : res.json()
}

interface DesiredRule {
    name: string
    triggerType: number
    triggerMetadata: Record<string, unknown>
}

function desiredRules(cfg: AutoModSettings): DesiredRule[] {
    // With a domain allowlist the link check is Demon's own (Discord cannot express "except these domains")
    const nativeLinks = cfg.blockLinks && cfg.allowedDomains.length === 0
    const regexes = [
        ...(cfg.blockInvites ? [INVITE_REGEX] : []),
        ...(nativeLinks ? [LINK_REGEX] : []),
        ...cfg.regexPatterns,
    ].slice(0, 10)

    const rules: DesiredRule[] = []
    for (let i = 0; i < MAX_KEYWORD_SHARDS; i++) {
        const list = cfg.blockedWords.slice(i * WORDS_PER_RULE, (i + 1) * WORDS_PER_RULE)
        if (list.length) rules.push({ name: shardName(i), triggerType: KEYWORD, triggerMetadata: { keyword_filter: list } })
    }
    if (regexes.length) rules.push({ name: "Demon: invites & links", triggerType: KEYWORD, triggerMetadata: { regex_patterns: regexes } })
    if (cfg.presets.length) rules.push({ name: "Demon: content filters", triggerType: KEYWORD_PRESET, triggerMetadata: { presets: cfg.presets } })
    if (cfg.antiSpam) rules.push({ name: "Demon: spam", triggerType: SPAM, triggerMetadata: {} })
    if (cfg.maxMentions > 0) {
        rules.push({
            name: "Demon: mention spam",
            triggerType: MENTION_SPAM,
            triggerMetadata: { mention_total_limit: Math.min(cfg.maxMentions, 50), mention_raid_protection_enabled: cfg.raidProtection },
        })
    }
    return rules
}

export async function syncNativeRules(guildId: string, cfg: AutoModSettings): Promise<NativeSyncResult> {
    const result: NativeSyncResult = { ok: true, created: 0, updated: 0, removed: 0 }
    try {
        const bot = await getBotUser()
        if (!bot) throw new Error("bot_unavailable")

        type ExistingRule = { id: string; name: string; creator_id: string }
        const existing = ((await discord(`/guilds/${guildId}/auto-moderation/rules`)) as ExistingRule[]).filter(
            (r) => r.creator_id === bot.id && typeof r.name === "string" && r.name.startsWith("Demon: ")
        )
        const wanted = cfg.enabled ? desiredRules(cfg) : []
        const wantedNames = new Set(wanted.map((w) => w.name))

        for (const rule of existing) {
            if (!wantedNames.has(rule.name)) {
                await discord(`/guilds/${guildId}/auto-moderation/rules/${rule.id}`, { method: "DELETE" })
                result.removed++
            }
        }
        for (const w of wanted) {
            const body = {
                name: w.name,
                event_type: 1,
                trigger_metadata: w.triggerMetadata,
                actions: [{ type: 1, metadata: { custom_message: BLOCK_MESSAGE } }],
                enabled: true,
                exempt_roles: cfg.ignoredRoles.slice(0, 20),
                exempt_channels: cfg.ignoredChannels.slice(0, 50),
            }
            const current = existing.find((r) => r.name === w.name)
            if (current) {
                await discord(`/guilds/${guildId}/auto-moderation/rules/${current.id}`, { method: "PATCH", body: JSON.stringify(body) })
                result.updated++
            } else {
                await discord(`/guilds/${guildId}/auto-moderation/rules`, { method: "POST", body: JSON.stringify({ ...body, trigger_type: w.triggerType }) })
                result.created++
            }
        }
    } catch (error) {
        result.ok = false
        result.error = error instanceof Error ? error.message : "sync_failed"
    }
    return result
}
