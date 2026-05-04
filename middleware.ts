/**
 * Next.js Edge Middleware — Central security layer.
 *
 * Responsibilities (in order):
 *  1. Rate limit every API request by IP
 *  2. Block CORS requests from foreign origins on /api/* routes
 *  3. Require a valid NextAuth session for all /api/guilds/* routes
 *  4. Require a valid NextAuth session for all /dashboard/* sub-routes
 *     (/dashboard itself is public — it renders the sign-in prompt)
 *  5. Set security response headers on every response
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { checkRateLimit } from "@/lib/rate-limit"

// ─── Public API routes (no auth required) ──────────────────────────────────
const PUBLIC_API_PREFIXES = [
    "/api/auth",        // NextAuth sign-in / callback / session endpoints
    "/api/bot-stats",   // Public stats widget — rate-limited but open
]

// ─── Allowed origins for CORS ───────────────────────────────────────────────
const ALLOWED_ORIGINS =
    process.env.NODE_ENV === "production"
        ? [
            process.env.NEXTAUTH_URL ?? "",
            "https://demonbot.vercel.app",
        ].filter(Boolean)
        : ["http://localhost:3000", "http://127.0.0.1:3000"] // Allow local and IP in development

function getClientIp(req: NextRequest): string {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "127.0.0.1"
    )
}

function isPublicApiRoute(pathname: string): boolean {
    return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

/**
 * Apply security headers to any response.
 * These are also set in next.config.mjs for non-middleware responses, but
 * setting them here ensures Edge responses get them too.
 */
function applySecurityHeaders(response: NextResponse, pathname: string): void {
    // Prevent clickjacking
    response.headers.set("X-Frame-Options", "DENY")
    // Prevent MIME sniffing
    response.headers.set("X-Content-Type-Options", "nosniff")
    // No referrer leaking
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    // Disable DNS prefetch
    response.headers.set("X-DNS-Prefetch-Control", "off")
    // Permissions policy
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
    )

    // API routes: never cache, never index
    if (pathname.startsWith("/api/")) {
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
        response.headers.set("Pragma", "no-cache")
        response.headers.set("Expires", "0")
        response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive")
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const ip = getClientIp(request)

    // ── 1. Rate limiting ─────────────────────────────────────────────────────
    const rateLimit = checkRateLimit(ip, pathname)
    if (!rateLimit.success) {
        const res = NextResponse.json(
            { error: "Too many requests. Please slow down." },
            { status: 429 }
        )
        res.headers.set("Retry-After", String(Math.ceil((rateLimit.reset - Date.now()) / 1000)))
        res.headers.set("X-RateLimit-Limit", String(rateLimit.limit))
        res.headers.set("X-RateLimit-Remaining", "0")
        res.headers.set("X-RateLimit-Reset", String(rateLimit.reset))
        applySecurityHeaders(res, pathname)
        return res
    }

    // ── 2. CORS enforcement on API routes ─────────────────────────────────────
    if (pathname.startsWith("/api/")) {
        const origin = request.headers.get("origin")

        // Handle CORS preflight
        if (request.method === "OPTIONS") {
            const res = new NextResponse(null, { status: 204 })
            if (origin && ALLOWED_ORIGINS.includes(origin)) {
                res.headers.set("Access-Control-Allow-Origin", origin)
                res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
                res.headers.set("Access-Control-Max-Age", "86400")
            } else if (origin) {
                // Reject preflight from unknown origins
                return new NextResponse(null, { status: 403 })
            }
            applySecurityHeaders(res, pathname)
            return res
        }

        // For actual requests with an origin header (i.e., cross-origin fetch)
        // reject if the origin is not in our allowlist
        if (origin && !ALLOWED_ORIGINS.includes(origin)) {
            const res = NextResponse.json(
                { error: "Forbidden: cross-origin requests not allowed" },
                { status: 403 }
            )
            applySecurityHeaders(res, pathname)
            return res
        }
    }

    // ── 3. Auth guard for protected API routes ────────────────────────────────
    if (pathname.startsWith("/api/") && !isPublicApiRoute(pathname)) {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        })

        if (!token) {
            const res = NextResponse.json(
                { error: "Unauthorized: please sign in" },
                { status: 401 }
            )
            applySecurityHeaders(res, pathname)
            return res
        }
    }

    // ── 4. Auth guard for protected dashboard page routes ────────────────────
    // /dashboard itself is intentionally public (renders the Discord sign-in prompt).
    // Every deeper path — /dashboard/[guildId] and any sub-module — requires a
    // valid session. Unauthenticated visitors are redirected back to /dashboard.
    if (pathname.startsWith("/dashboard/")) {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        })

        if (!token) {
            const loginUrl = new URL("/dashboard", request.url)
            loginUrl.searchParams.set("callbackUrl", pathname)
            const res = NextResponse.redirect(loginUrl)
            applySecurityHeaders(res, pathname)
            return res
        }
    }

    // ── 5. Pass through — apply headers to the forwarded response ────────────
    const response = NextResponse.next()

    // Rate limit headers (informational)
    response.headers.set("X-RateLimit-Limit", String(rateLimit.limit))
    response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining))
    response.headers.set("X-RateLimit-Reset", String(rateLimit.reset))

    applySecurityHeaders(response, pathname)
    return response
}

export const config = {
    // Run middleware on all routes except Next.js internals and static files
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|mp4|webm|woff2?|ttf|eot)).*)",
    ],
}
