import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"

// Simple in-memory rate limiter: max 5 sends per guild per minute
const rateLimits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(guildId: string): boolean {
    const now = Date.now()
    const entry = rateLimits.get(guildId)

    if (!entry || now > entry.resetAt) {
        rateLimits.set(guildId, { count: 1, resetAt: now + 60_000 })
        return true
    }

    if (entry.count >= 5) return false

    entry.count++
    return true
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

    if (!checkRateLimit(guildId)) {
        return NextResponse.json(
            { error: "Rate limited. Max 5 sends per minute." },
            { status: 429 }
        )
    }

    try {
        // Guard body size: reject requests over 5 KB to prevent content-bombing
        const rawBody = await request.text()
        if (rawBody.length > 5_120) {
            return NextResponse.json({ error: "Payload too large (max 5 KB)" }, { status: 413 })
        }
        const { webhookUrl, payload } = JSON.parse(rawBody)

        if (!webhookUrl || !payload) {
            return NextResponse.json(
                { error: "webhookUrl and payload are required" },
                { status: 400 }
            )
        }

        // Validate webhook URL format
        if (!/^https:\/\/discord\.com\/api\/webhooks\/\d+\/.+$/.test(webhookUrl)) {
            return NextResponse.json({ error: "Invalid webhook URL" }, { status: 400 })
        }

        // Validate payload has content or embeds
        if (!payload.content && (!payload.embeds || payload.embeds.length === 0)) {
            return NextResponse.json(
                { error: "Message must have content or embeds" },
                { status: 400 }
            )
        }

        // Send to Discord webhook
        const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })

        if (!res.ok) {
            // Log internal details but don't expose to client
            const errorBody = await res.text()
            console.error("Discord webhook error:", res.status, errorBody)
            return NextResponse.json(
                { error: "Failed to send message via webhook" },
                { status: res.status }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error sending webhook:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
