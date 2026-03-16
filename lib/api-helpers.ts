/**
 * Central API security helpers.
 *
 * Provides:
 *  - parseBody()        — safe body parser with size cap + JSON validation
 *  - pickAllowed()      — schema-based allowlist to prevent mass-assignment
 *  - ALLOWED_FIELDS     — per-model field whitelists, derived from Mongoose schemas
 *  - validateObjectId() — MongoDB ObjectId format check (24-char hex)
 *  - sanitizeString()   — strip null-bytes and control chars from user strings
 */

import { NextRequest } from "next/server"
import mongoose from "mongoose"

// ── Body size guard ───────────────────────────────────────────────────────────
const MAX_BODY_BYTES = 10_240 // 10 KB — more than enough for any dashboard form

/**
 * Safely parse a JSON request body.
 *
 * Returns { ok: true, data } or { ok: false, error, status }.
 * Rejects bodies that are too large or not valid JSON.
 */
export async function parseBody<T = Record<string, unknown>>(
    request: Request | NextRequest
): Promise<{ ok: true; data: T } | { ok: false; error: string; status: number }> {
    const contentLength = request.headers.get("content-length")
    if (contentLength && parseInt(contentLength) > MAX_BODY_BYTES) {
        return { ok: false, error: "Request body too large (max 10 KB)", status: 413 }
    }

    try {
        const text = await request.text()
        if (text.length > MAX_BODY_BYTES) {
            return { ok: false, error: "Request body too large (max 10 KB)", status: 413 }
        }
        const data = JSON.parse(text) as T
        if (typeof data !== "object" || data === null || Array.isArray(data)) {
            return { ok: false, error: "Request body must be a JSON object", status: 400 }
        }
        return { ok: true, data }
    } catch {
        return { ok: false, error: "Invalid JSON in request body", status: 400 }
    }
}

// ── MongoDB ObjectId validation ───────────────────────────────────────────────
const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/

/**
 * Validate a MongoDB ObjectId string.
 * Prevents passing arbitrary strings to Mongoose findOne({ _id: ... }).
 */
export function validateObjectId(id: string): boolean {
    return typeof id === "string" && OBJECT_ID_RE.test(id)
}

// ── String sanitization ───────────────────────────────────────────────────────

/**
 * Strip null bytes and ASCII control characters from a string.
 * Use on any user-supplied string field before storing in DB.
 */
export function sanitizeString(value: unknown, maxLength = 2000): string | null {
    if (typeof value !== "string") return null
    const cleaned = value
        .replace(/\x00/g, "")                // strip null bytes
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control chars (keep \t\n\r)
        .slice(0, maxLength)
    return cleaned
}

// ── Schema-based allowlists (mass-assignment prevention) ─────────────────────
// These exactly mirror the writable fields in each Mongoose schema.
// When a model gets new fields, add them here too.

type AllowlistMap = Record<string, readonly string[]>

export const ALLOWED_FIELDS = {
    welcome: [
        "enabled", "channelId", "message", "embedEnabled", "embedColor",
        "embedTitle", "embedDescription", "embedImage", "embedThumbnail",
        "embedFooter", "dmEnabled", "dmMessage", "imageEnabled", "imageTemplate",
        "embedChannelId", "plainEnabled", "plainChannelId",
    ],
    leave: [
        "enabled", "channelId", "message", "embedEnabled", "embedColor",
        "embedTitle", "embedDescription", "embedFooter", "embedThumbnail",
        "embedImage", "logEnabled", "logChannelId", "showJoinDate",
        "showAccountAge", "showRoles",
    ],
    logging: [
        "enabled", "mode", "channelId", "channels", "eventChannels", "events",
    ],
    guild: [
        "botUpdatesChannelId",
    ],
    autorole: [
        "enabled", "roleIds", "delay", "conditions", "logChannelId",
    ],
    verification: [
        "enabled", "channelId", "roleId", "unverifiedRoleId", "messageId",
        "embedTitle", "embedDescription", "embedColor", "buttonLabel",
        "verifiedMessage", "kickUnverified", "kickTimeout", "type",
        "minAccountAge", "logChannelId",
    ],
    security_config: [
        "enabled", "captchaRequired", "protections", "limits", "punishment", "securityLogChannelId",
    ],
    security_whitelist: [
        "userId", "roleId", "entryType", "categories", "addedBy", "reason",
    ],
    security_violation: [
        "moderatorId", "moderatorNote", "resolvedAt",
    ],
} as const satisfies AllowlistMap

/**
 * Pick only allowed keys from a user-supplied body object.
 * Any extra keys are silently dropped, preventing mass-assignment.
 *
 * @param body   Raw body parsed from request
 * @param model  Which ALLOWED_FIELDS key to use
 */
export function pickAllowed(
    body: Record<string, unknown>,
    model: keyof typeof ALLOWED_FIELDS
): Record<string, unknown> {
    const allowed = ALLOWED_FIELDS[model] as readonly string[]
    const safe: Record<string, unknown> = {}
    for (const key of allowed) {
        if (key in body) {
            safe[key] = body[key]
        }
    }
    return safe
}

/**
 * Deeply validate that an object only contains plain JSON types:
 * string | number | boolean | null | array | plain object.
 * Rejects Mongoose query operators like $where, $gt, $regex, etc.
 */
export function hasMongoOperators(value: unknown, depth = 0): boolean {
    if (depth > 10) return false // don't blow the stack
    if (typeof value === "string") return value.startsWith("$")
    if (typeof value === "object" && value !== null) {
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            if (k.startsWith("$")) return true
            if (hasMongoOperators(v, depth + 1)) return true
        }
    }
    if (Array.isArray(value)) {
        return (value as unknown[]).some((v) => hasMongoOperators(v, depth + 1))
    }
    return false
}
