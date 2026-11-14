/**
 * Strict validation for the module settings the dashboard can write. Every function takes the raw (untrusted)
 * JSON body and returns only fields it has checked, or an error message. Nothing is silently clamped, and
 * unknown fields are dropped, so a request can never write anything the form could not.
 */

export type Validated = { ok: true; data: Record<string, unknown> } | { ok: false; error: string }

const SNOWFLAKE = /^\d{17,20}$/
const DOMAIN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/

export const LIMITS = {
    blockedWords: 4000, // 4 Discord keyword rules x 1000
    smartWords: 1000,
    wordLength: 60,
    regexPatterns: 8,
    regexLength: 260,
    domains: 50,
    ignoredChannels: 50,
    ignoredRoles: 20,
} as const

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)

function stringList(
    value: unknown,
    name: string,
    max: number,
    maxLen: number,
    opts: { lower?: boolean; pattern?: RegExp; normalize?: (s: string) => string } = {}
): { ok: true; value: string[] } | { ok: false; error: string } {
    if (!Array.isArray(value)) return { ok: false, error: `${name} must be a list` }
    const seen = new Set<string>()
    for (const item of value) {
        if (typeof item !== "string") return { ok: false, error: `${name} must only contain text` }
        let s = item.trim()
        if (opts.lower) s = s.toLowerCase()
        if (opts.normalize) s = opts.normalize(s)
        if (!s) continue
        if (s.length > maxLen) return { ok: false, error: `${name}: "${s.slice(0, 20)}…" is longer than ${maxLen} characters` }
        if (opts.pattern && !opts.pattern.test(s)) return { ok: false, error: `${name}: "${s.slice(0, 40)}" is not valid` }
        if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(s)) return { ok: false, error: `${name} contains control characters` }
        seen.add(s)
    }
    if (seen.size > max) return { ok: false, error: `${name} can have at most ${max} entries` }
    return { ok: true, value: [...seen] }
}

type Rule =
    | { type: "boolean" }
    | { type: "int"; min: number; max: number }

function applyRules(body: Record<string, unknown>, rules: Record<string, Rule>, out: Record<string, unknown>): string | null {
    for (const [key, rule] of Object.entries(rules)) {
        if (!(key in body)) continue
        const v = body[key]
        if (rule.type === "boolean") {
            if (typeof v !== "boolean") return `${key} must be true or false`
        } else if (typeof v !== "number" || !Number.isInteger(v) || v < rule.min || v > rule.max) {
            return `${key} must be a whole number from ${rule.min} to ${rule.max}`
        }
        out[key] = v
    }
    return null
}

export function validateAutoMod(body: unknown): Validated {
    if (!isObject(body)) return { ok: false, error: "Body must be an object" }
    const out: Record<string, unknown> = {}

    const err = applyRules(
        body,
        {
            enabled: { type: "boolean" },
            blockInvites: { type: "boolean" },
            blockLinks: { type: "boolean" },
            raidProtection: { type: "boolean" },
            antiSpam: { type: "boolean" },
            scamProtection: { type: "boolean" },
            blockDuplicates: { type: "boolean" },
            blockZalgo: { type: "boolean" },
            maxMentions: { type: "int", min: 0, max: 50 },
            maxCapsPercent: { type: "int", min: 0, max: 100 },
            maxEmojis: { type: "int", min: 0, max: 100 },
            maxLines: { type: "int", min: 0, max: 100 },
            strikeLimit: { type: "int", min: 0, max: 20 },
            strikeTimeoutMin: { type: "int", min: 1, max: 1440 },
        },
        out
    )
    if (err) return { ok: false, error: err }

    const lists: [string, number, number, Parameters<typeof stringList>[4]][] = [
        ["blockedWords", LIMITS.blockedWords, LIMITS.wordLength, { lower: true }],
        ["smartWords", LIMITS.smartWords, LIMITS.wordLength, { lower: true }],
        ["ignoredChannels", LIMITS.ignoredChannels, 20, { pattern: SNOWFLAKE }],
        ["ignoredRoles", LIMITS.ignoredRoles, 20, { pattern: SNOWFLAKE }],
        [
            "allowedDomains",
            LIMITS.domains,
            100,
            {
                lower: true,
                normalize: (s) => s.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0],
                pattern: DOMAIN,
            },
        ],
    ]
    for (const [key, max, len, opts] of lists) {
        if (!(key in body)) continue
        const r = stringList(body[key], key, max, len, opts)
        if (!r.ok) return r
        out[key] = r.value
    }

    if ("regexPatterns" in body) {
        const r = stringList(body.regexPatterns, "regexPatterns", LIMITS.regexPatterns, LIMITS.regexLength)
        if (!r.ok) return r
        for (const p of r.value) {
            try {
                new RegExp(p.replace(/^\(\?i\)/, ""))
            } catch {
                return { ok: false, error: `regexPatterns: "${p.slice(0, 40)}" is not a valid regular expression` }
            }
        }
        out.regexPatterns = r.value
    }

    if ("presets" in body) {
        const v = body.presets
        if (!Array.isArray(v) || !v.every((n) => n === 1 || n === 2 || n === 3)) {
            return { ok: false, error: "presets must only contain 1 (profanity), 2 (sexual content) or 3 (slurs)" }
        }
        out.presets = [...new Set(v as number[])]
    }

    // A word can live in one list only (the smart list wins)
    if (Array.isArray(out.blockedWords) && Array.isArray(out.smartWords)) {
        const smart = new Set(out.smartWords as string[])
        out.blockedWords = (out.blockedWords as string[]).filter((w) => !smart.has(w))
    }
    return { ok: true, data: out }
}

export function validateRaid(body: unknown): Validated {
    if (!isObject(body)) return { ok: false, error: "Body must be an object" }
    const out: Record<string, unknown> = {}
    const err = applyRules(
        body,
        {
            enabled: { type: "boolean" },
            joinThreshold: { type: "int", min: 2, max: 100 },
            windowSeconds: { type: "int", min: 5, max: 300 },
            raidDurationMin: { type: "int", min: 1, max: 120 },
            minAccountAgeDays: { type: "int", min: 0, max: 365 },
        },
        out
    )
    if (err) return { ok: false, error: err }
    if ("action" in body) {
        if (typeof body.action !== "string" || !["alert", "timeout", "kick", "ban"].includes(body.action)) {
            return { ok: false, error: "action must be alert, timeout, kick or ban" }
        }
        out.action = body.action
    }
    return { ok: true, data: out }
}

/**
 * Command and category switches. Only names the bot actually has are accepted, and the protected ones can
 * never be switched off, so a request cannot lock people out of /help or touch developer commands.
 */
export function validateCommandToggle(
    body: unknown,
    catalog: { commands: ReadonlySet<string>; categories: ReadonlySet<string>; protectedCommands: ReadonlySet<string>; protectedCategories: ReadonlySet<string> }
): Validated {
    if (!isObject(body)) return { ok: false, error: "Body must be an object" }
    const out: Record<string, unknown> = {}
    for (const [key, known, locked] of [
        ["disabledCommands", catalog.commands, catalog.protectedCommands],
        ["disabledCategories", catalog.categories, catalog.protectedCategories],
    ] as const) {
        if (!(key in body)) continue
        const r = stringList(body[key], key, 500, 40)
        if (!r.ok) return r
        for (const name of r.value) {
            if (!known.has(name)) return { ok: false, error: `${key}: unknown name "${name.slice(0, 40)}"` }
            if (locked.has(name)) return { ok: false, error: `${key}: "${name}" cannot be switched off` }
        }
        out[key] = r.value
    }
    return { ok: true, data: out }
}
