/**
 * In-memory sliding window rate limiter.
 * Keyed by IP + route category. Works on Edge and Node.js runtimes.
 * No Redis required — state resets on cold starts (acceptable for serverless).
 */

interface RateLimitEntry {
    timestamps: number[]
    blocked: boolean
}

// Global store — survives across requests within the same serverless instance
const store = new Map<string, RateLimitEntry>()

// Limits per route category
const LIMITS: Record<string, { max: number; windowMs: number }> = {
    auth: { max: 10, windowMs: 60_000 },  // 10 req/min — anti brute-force
    stats: { max: 20, windowMs: 60_000 },  // 20 req/min — public endpoint
    guilds: { max: 60, windowMs: 60_000 },  // 60 req/min — authenticated API
    default: { max: 30, windowMs: 60_000 },  // fallback
}

function categorise(pathname: string): string {
    if (pathname.startsWith("/api/auth")) return "auth"
    if (pathname.startsWith("/api/bot-stats")) return "stats"
    if (pathname.startsWith("/api/guilds")) return "guilds"
    return "default"
}

export interface RateLimitResult {
    success: boolean
    limit: number
    remaining: number
    reset: number  // Unix ms timestamp when the window resets
}

/**
 * Check rate limit for a given IP and URL path.
 * Call this before processing a request; if success is false, return 429.
 */
export function checkRateLimit(ip: string, pathname: string): RateLimitResult {
    const category = categorise(pathname)
    const { max, windowMs } = LIMITS[category]
    const key = `${ip}:${category}`
    const now = Date.now()
    const windowStart = now - windowMs

    // Get or create entry
    let entry = store.get(key)
    if (!entry) {
        entry = { timestamps: [], blocked: false }
        store.set(key, entry)
    }

    // Prune timestamps outside the current window
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart)

    if (entry.timestamps.length >= max) {
        const reset = entry.timestamps[0] + windowMs
        return { success: false, limit: max, remaining: 0, reset }
    }

    entry.timestamps.push(now)
    const remaining = max - entry.timestamps.length

    // Clean up old entries to prevent memory leaks — runs every 500 checks
    if (Math.random() < 0.002) {
        for (const [k, v] of store.entries()) {
            if (v.timestamps.every((t) => t <= windowStart)) {
                store.delete(k)
            }
        }
    }

    return { success: true, limit: max, remaining, reset: now + windowMs }
}
