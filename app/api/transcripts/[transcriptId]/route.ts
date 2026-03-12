import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Transcript from "@/lib/models/Transcript"

export const dynamic = "force-dynamic"

/**
 * GET /api/transcripts/[transcriptId]
 * Get transcript HTML by ID (public endpoint)
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ transcriptId: string }> }
) {
    const { transcriptId } = await params

    try {
        await connectToDatabase()

        const transcript = await Transcript.findByTranscriptId(transcriptId)

        if (!transcript) {
            return NextResponse.json({ error: "Transcript not found" }, { status: 404 })
        }

        return NextResponse.json({
            transcriptId: transcript.transcriptId,
            ticketId: transcript.ticketId,
            html: transcript.html,
            messageCount: transcript.messageCount,
            generatedAt: transcript.generatedAt
        })
    } catch (error) {
        console.error("Error fetching transcript:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
