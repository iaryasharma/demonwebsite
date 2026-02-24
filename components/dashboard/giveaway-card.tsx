"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faGift,
    faClock,
    faUsers,
    faTrophy,
    faCircleCheck,
    faCircleXmark,
    faStop,
    faBan,
    faRotate,
    faTrash,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"

interface GiveawayCardProps {
    giveaway: {
        _id: string
        messageId: string
        channelId: string
        prize: string
        description: string | null
        winnerCount: number
        duration: number
        startTime: string
        endTime: string
        participants: string[]
        winners: string[]
        isActive: boolean
        isEnded: boolean
        requiredRole: string | null
        endedAt: string | null
        endedBy: string | null
    }
    guildId: string
    onAction?: () => void
}

function formatTimeAgo(dateStr: string): string {
    const now = Date.now()
    const date = new Date(dateStr).getTime()
    const diff = now - date

    if (diff < 0) {
        const remaining = Math.abs(diff)
        const minutes = Math.floor(remaining / 60000)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)
        if (days > 0) return `Ends in ${days}d ${hours % 24}h`
        if (hours > 0) return `Ends in ${hours}h ${minutes % 60}m`
        if (minutes > 0) return `Ends in ${minutes}m`
        return "Ends soon"
    }

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    if (days > 0) return `Ended ${days}d ago`
    if (hours > 0) return `Ended ${hours}h ago`
    if (minutes > 0) return `Ended ${minutes}m ago`
    return "Ended just now"
}

function canRerollCheck(endedAt: string | null): { allowed: boolean; timeLeft?: string } {
    if (!endedAt) return { allowed: false }
    const endedTime = new Date(endedAt).getTime()
    const deadline = endedTime + 36 * 60 * 60 * 1000
    const remaining = deadline - Date.now()
    if (remaining <= 0) return { allowed: false }
    const hours = Math.floor(remaining / (60 * 60 * 1000))
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / 60000)
    return { allowed: true, timeLeft: `${hours}h ${minutes}m` }
}

export function GiveawayCard({ giveaway, guildId, onAction }: GiveawayCardProps) {
    const isActive = giveaway.isActive && !giveaway.isEnded
    const isCancelled = giveaway.endedBy === "dashboard-cancel" || giveaway.endedBy === "cancel"

    const [loading, setLoading] = useState<string | null>(null)
    const [confirmAction, setConfirmAction] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const rerollStatus = !isActive ? canRerollCheck(giveaway.endedAt) : { allowed: false }

    const performAction = async (action: string) => {
        setLoading(action)
        setError(null)
        setConfirmAction(null)

        try {
            const method = action === "delete" ? "DELETE" : "POST"
            const res = await fetch(
                `/api/guilds/${guildId}/giveaways/${giveaway._id}/${action}`,
                { method }
            )

            if (!res.ok) {
                const data = await res.json()
                setError(data.error || "Action failed")
            } else {
                onAction?.()
            }
        } catch {
            setError("Network error")
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            {/* Main info */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : isCancelled
                                        ? "bg-red-500/10 text-red-400"
                                        : "bg-gray-500/10 text-gray-400"
                                }`}
                        >
                            <FontAwesomeIcon icon={faGift} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{giveaway.prize}</p>
                            {giveaway.description && (
                                <p className="text-xs text-gray-500 truncate">{giveaway.description}</p>
                            )}
                        </div>
                    </div>
                    <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium flex-shrink-0 ${isActive
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : isCancelled
                                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                    : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                            }`}
                    >
                        <FontAwesomeIcon
                            icon={isActive ? faCircleCheck : faCircleXmark}
                            className="w-2.5 h-2.5"
                        />
                        {isActive ? "Active" : isCancelled ? "Cancelled" : "Ended"}
                    </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <FontAwesomeIcon icon={faTrophy} className="w-3 h-3 text-yellow-500/60" />
                        <span>{giveaway.winnerCount} winner{giveaway.winnerCount !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <FontAwesomeIcon icon={faUsers} className="w-3 h-3 text-blue-400/60" />
                        <span>{giveaway.participants.length} entries</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <FontAwesomeIcon icon={faClock} className="w-3 h-3 text-purple-400/60" />
                        <span>{formatTimeAgo(giveaway.endTime)}</span>
                    </div>
                </div>

                {/* Winners */}
                {giveaway.winners.length > 0 && (
                    <div className="mb-3">
                        <p className="text-[11px] text-gray-500 mb-1">Winners</p>
                        <div className="flex gap-1.5 flex-wrap">
                            {giveaway.winners.map((w) => (
                                <span
                                    key={w}
                                    className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 text-[11px] font-mono"
                                >
                                    {w}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reroll timer for ended giveaways */}
                {!isActive && !isCancelled && rerollStatus.allowed && (
                    <p className="text-[11px] text-purple-400/60 mb-2">
                        ⏰ Reroll available for {rerollStatus.timeLeft}
                    </p>
                )}

                {/* Error */}
                {error && (
                    <p className="text-xs text-red-400 mb-2">⚠️ {error}</p>
                )}
            </div>

            {/* Confirmation bar */}
            {confirmAction && (
                <div className="px-4 py-2.5 bg-red-500/5 border-t border-red-500/10">
                    <p className="text-xs text-red-300 mb-2">
                        Are you sure you want to <strong>{confirmAction}</strong> this giveaway?
                        {confirmAction === "delete" && " This cannot be undone."}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => performAction(confirmAction)}
                            disabled={!!loading}
                            className="px-3 py-1 rounded-md bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                            {loading === confirmAction ? (
                                <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                            ) : (
                                "Confirm"
                            )}
                        </button>
                        <button
                            onClick={() => setConfirmAction(null)}
                            className="px-3 py-1 rounded-md bg-white/[0.06] text-gray-400 text-xs hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Action buttons */}
            {!confirmAction && (
                <div className="flex items-center gap-1 px-3 py-2 bg-white/[0.01] border-t border-white/[0.04]">
                    {isActive && (
                        <>
                            <button
                                onClick={() => setConfirmAction("end")}
                                disabled={!!loading}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faStop} className="w-3 h-3" />
                                End
                            </button>
                            <button
                                onClick={() => setConfirmAction("cancel")}
                                disabled={!!loading}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-yellow-400 hover:bg-yellow-500/10 transition-colors disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faBan} className="w-3 h-3" />
                                Cancel
                            </button>
                        </>
                    )}

                    {!isActive && !isCancelled && rerollStatus.allowed && (
                        <button
                            onClick={() => performAction("reroll")}
                            disabled={!!loading}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                        >
                            {loading === "reroll" ? (
                                <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                            ) : (
                                <FontAwesomeIcon icon={faRotate} className="w-3 h-3" />
                            )}
                            Reroll
                        </button>
                    )}

                    <div className="flex-1" />

                    <button
                        onClick={() => setConfirmAction("delete")}
                        disabled={!!loading}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                        Delete
                    </button>
                </div>
            )}
        </div>
    )
}
