"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner, faFileCircleXmark, faLock } from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"

interface TranscriptData {
    transcriptId: string
    ticketId: string
    html: string
    messageCount: number
    generatedAt: string
}

export default function TranscriptPage({
    params,
}: {
    params: Promise<{ transcriptId: string }>
}) {
    const { transcriptId } = React.use(params)
    const { data: session, status } = useSession()

    const { data: transcript, isLoading, error } = useQuery<TranscriptData>({
        queryKey: ["transcript", transcriptId],
        queryFn: async () => {
            const res = await fetch(`/api/transcripts/${transcriptId}`)
            if (!res.ok) throw new Error("Transcript not found")
            return res.json()
        },
        enabled: !!transcriptId && status === "authenticated",
    })

    // Check authentication
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#36393f] flex items-center justify-center">
                <div className="text-center">
                    <FontAwesomeIcon
                        icon={faSpinner}
                        className="w-12 h-12 text-[#5865f2] animate-spin mb-4"
                    />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen bg-[#36393f] flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <FontAwesomeIcon
                        icon={faLock}
                        className="w-16 h-16 text-blue-500 mb-6"
                    />
                    <h1 className="text-3xl font-bold text-white mb-3">Authentication Required</h1>
                    <p className="text-gray-400 mb-6">
                        You need to sign in with Discord to view this transcript.
                    </p>
                    <Link
                        href="/api/auth/signin"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold transition-all shadow-lg shadow-[#5865f2]/20"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 127.14 96.36" fill="currentColor">
                            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
                        </svg>
                        Sign in with Discord
                    </Link>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#36393f] flex items-center justify-center">
                <div className="text-center">
                    <FontAwesomeIcon
                        icon={faSpinner}
                        className="w-12 h-12 text-[#5865f2] animate-spin mb-4"
                    />
                    <p className="text-gray-400">Loading transcript...</p>
                </div>
            </div>
        )
    }

    if (error || !transcript) {
        return (
            <div className="min-h-screen bg-[#36393f] flex items-center justify-center">
                <div className="text-center">
                    <FontAwesomeIcon
                        icon={faFileCircleXmark}
                        className="w-16 h-16 text-red-500 mb-4"
                    />
                    <h1 className="text-2xl font-bold text-white mb-2">Transcript Not Found</h1>
                    <p className="text-gray-400">
                        The requested transcript does not exist or has been removed.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div
            className="transcript-container"
            dangerouslySetInnerHTML={{ __html: transcript.html }}
        />
    )
}
