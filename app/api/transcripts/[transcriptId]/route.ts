import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Transcript from "@/lib/models/Transcript"
import { checkRateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

/**
 * GET /api/transcripts/[transcriptId]
 * Get transcript HTML by ID (public endpoint with rate limiting)
 * 
 * Security:
 * - Rate limited to 20 req/min per IP (public endpoint category)
 * - Validates transcript ID format
 * - Returns limited data fields to prevent info leakage
 * - No sensitive server details in error messages
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ transcriptId: string }> }
) {
    const { transcriptId } = await params

    // Security: Extract client IP for rate limiting
    const ip = 
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        "unknown"

    // Rate limiting check
    const rateLimitResult = checkRateLimit(ip, "/api/transcripts")
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: "Rate limit exceeded" },
            {
                status: 429,
                headers: {
                    "Retry-After": String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
                    "X-RateLimit-Limit": String(rateLimitResult.limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": String(rateLimitResult.reset),
                }
            }
        )
    }

    // Input validation: Check transcript ID format
    if (!transcriptId || typeof transcriptId !== "string" || transcriptId.length > 100) {
        return NextResponse.json(
            { error: "Invalid transcript ID" },
            { status: 400 }
        )
    }

    try {
        await connectToDatabase()

        const transcript = await Transcript.findByTranscriptId(transcriptId)

        if (!transcript) {
            return NextResponse.json(
                { error: "Transcript not found" },
                { status: 404 }
            )
        }

        // Return response with security headers
        return NextResponse.json(
            {
                transcriptId: transcript.transcriptId,
                ticketId: transcript.ticketId,
                html: transcript.html,
                messageCount: transcript.messageCount,
                generatedAt: transcript.generatedAt,
                expiresAt: new Date(transcript.generatedAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                headers: {
                    "X-RateLimit-Limit": String(rateLimitResult.limit),
                    "X-RateLimit-Remaining": String(rateLimitResult.remaining),
                    "X-RateLimit-Reset": String(rateLimitResult.reset),
                    "X-Content-Type-Options": "nosniff",
                    "X-Frame-Options": "DENY",
                    "Cache-Control": "private, no-cache, no-store, must-revalidate"
                }
            }
        )
    } catch (error) {
        console.error("Error fetching transcript:", error)
        
        // Log access attempt (optional security monitoring)
        console.warn(`Transcript access attempt: ID=${transcriptId}, IP=${ip}`)
        
        return NextResponse.json(
            { error: "Internal server error" },
            {
                status: 500,
                headers: {
                    "X-Content-Type-Options": "nosniff"
                }
            }
        )
    }
}
