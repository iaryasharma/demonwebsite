/**
 * Additional security helper functions for the Demon Bot Dashboard
 * 
 * This module provides extra security utilities beyond the core api-helpers.ts
 */

import { NextResponse } from "next/server"

/**
 * Sanitizes error messages to prevent information disclosure.
 * Use this for any error that might reveal system internals.
 */
export function genericErrorResponse(
    statusCode: 500 | 503 = 503,
    logMessage?: string
): NextResponse {
    if (logMessage) {
        console.error(`[SECURITY] ${logMessage}`)
    }
    
    const messages = {
        500: "Internal server error",
        503: "Service temporarily unavailable"
    }
    
    return NextResponse.json(
        { error: messages[statusCode] },
        { status: statusCode }
    )
}

/**
 * Validates that a Discord snowflake ID is properly formatted.
 * This should be used for all Discord entity IDs (guilds, channels, roles, users, messages).
 * 
 * A valid Discord snowflake is:
 * - A string of 17-20 numeric digits
 * - Represents a 64-bit integer timestamp + worker + process + increment
 */
const SNOWFLAKE_REGEX = /^\d{17,20}$/

export function isValidSnowflake(id: unknown): id is string {
    return typeof id === "string" && SNOWFLAKE_REGEX.test(id)
}

/**
 * Validates a Discord webhook URL to prevent SSRF attacks.
 * Only allows official Discord webhook URLs.
 */
const WEBHOOK_URL_REGEX = /^https:\/\/discord\.com\/api\/webhooks\/\d{17,20}\/[\w-]{68}$/

export function isValidDiscordWebhookUrl(url: unknown): boolean {
    return typeof url === "string" && WEBHOOK_URL_REGEX.test(url)
}

/**
 * Rate limiter for specific operations (beyond the global middleware rate limit)
 * Useful for expensive operations like sending messages, creating channels, etc.
 */
interface OperationRateLimit {
    count: number
    resetAt: number
}

const operationLimits = new Map<string, OperationRateLimit>()

/**
 * Check rate limit for a specific operation.
 * Returns true if the operation is allowed, false if rate limited.
 * 
 * @param key - Unique identifier (e.g., `guildId:operation`)
 * @param maxOperations - Maximum operations allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export function checkOperationRateLimit(
    key: string,
    maxOperations: number,
    windowMs: number
): { allowed: boolean; resetAt: number } {
    const now = Date.now()
    const entry = operationLimits.get(key)

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
        for (const [k, v] of operationLimits.entries()) {
            if (v.resetAt < now) {
                operationLimits.delete(k)
            }
        }
    }

    if (!entry || entry.resetAt < now) {
        operationLimits.set(key, { count: 1, resetAt: now + windowMs })
        return { allowed: true, resetAt: now + windowMs }
    }

    if (entry.count >= maxOperations) {
        return { allowed: false, resetAt: entry.resetAt }
    }

    entry.count++
    return { allowed: true, resetAt: entry.resetAt }
}

/**
 * Safely parse JSON from a string with error handling.
 * Returns null if parsing fails instead of throwing.
 */
export function safeJsonParse<T = any>(json: string): T | null {
    try {
        return JSON.parse(json) as T
    } catch {
        return null
    }
}

/**
 * Validate that a color value is a valid hex color or null.
 * Prevents injection of invalid color values.
 */
export function isValidHexColor(color: unknown): boolean {
    if (color === null || color === undefined) return true
    return typeof color === "string" && /^#[0-9A-Fa-f]{6}$/.test(color)
}

/**
 * Validate that a duration is within acceptable bounds.
 * Prevents users from creating giveaways/timeouts that are too long or too short.
 */
export function isValidDuration(durationMs: number, minMs: number, maxMs: number): boolean {
    return Number.isFinite(durationMs) && durationMs >= minMs && durationMs <= maxMs
}

/**
 * Sanitize a username or display name to prevent homograph attacks.
 * This is a basic implementation - Discord already handles most of this,
 * but we do additional sanitization for display in our UI.
 */
export function sanitizeDisplayName(name: string, maxLength = 32): string {
    return name
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width characters
        .trim()
        .slice(0, maxLength)
}

/**
 * Check if a user agent looks suspicious (potential bot/scraper).
 * This is a basic check and should not be relied upon for security,
 * but can be used for logging/monitoring purposes.
 */
export function isSuspiciousUserAgent(userAgent: string | null): boolean {
    if (!userAgent) return true
    
    const suspiciousPatterns = [
        /curl/i,
        /wget/i,
        /python-requests/i,
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i
    ]
    
    return suspiciousPatterns.some(pattern => pattern.test(userAgent))
}

/**
 * Create a secure token for one-time operations (e.g., webhook verification)
 * Uses crypto.getRandomValues for cryptographically secure randomness
 */
export function generateSecureToken(length = 32): string {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate that an array contains only valid snowflake IDs
 * Useful for validating arrays of role IDs, channel IDs, etc.
 */
export function areValidSnowflakes(ids: unknown[]): ids is string[] {
    return Array.isArray(ids) && ids.every(id => isValidSnowflake(id))
}

/**
 * Calculate the Levenshtein distance between two strings.
 * Useful for detecting similar commands or preventing typo-squatting.
 */
export function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = []

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i]
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1]
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                )
            }
        }
    }

    return matrix[b.length][a.length]
}

/**
 * Check if a string contains potentially dangerous Unicode characters
 * that could be used for visual spoofing or RTL override attacks.
 */
export function containsDangerousUnicode(text: string): boolean {
    // Check for RTL override characters
    const rtlOverride = /[\u202E\u202D]/
    
    // Check for zero-width characters (except zero-width space in certain contexts)
    const zeroWidth = /[\u200B-\u200D\uFEFF]/
    
    // Check for combining diacritical marks abuse (more than 3 in a row)
    const excessiveDiacritics = /[\u0300-\u036F]{4,}/
    
    return rtlOverride.test(text) || zeroWidth.test(text) || excessiveDiacritics.test(text)
}

/**
 * Validates that a URL is safe for redirects.
 * Only allows relative URLs or URLs from approved domains.
 */
export function isSafeRedirectUrl(url: string, allowedDomains: string[]): boolean {
    try {
        // Allow relative URLs
        if (url.startsWith('/') && !url.startsWith('//')) {
            return true
        }
        
        const parsed = new URL(url)
        
        // Only allow https
        if (parsed.protocol !== 'https:') {
            return false
        }
        
        // Check if domain is in allowlist
        return allowedDomains.some(domain => 
            parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
        )
    } catch {
        return false
    }
}

/**
 * Audit log entry for security-relevant actions.
 * In production, you might want to send these to a logging service.
 */
export function logSecurityEvent(event: {
    type: 'auth_failure' | 'rate_limit' | 'invalid_input' | 'permission_denied' | 'suspicious_activity'
    userId?: string
    guildId?: string
    ip?: string
    details?: string
}): void {
    const timestamp = new Date().toISOString()
    console.warn(`[SECURITY AUDIT ${timestamp}]`, JSON.stringify(event))
    
    // In production, send to your logging service:
    // await sendToLogService(event)
}
