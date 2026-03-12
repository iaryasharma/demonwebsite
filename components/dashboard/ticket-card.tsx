"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faTicket,
    faClock,
    faUser,
    faLockOpen,
    faLock,
    faCircleCheck,
    faCircleXmark,
    faArrowUp,
    faArrowDown,
    faEquals,
    faSpinner,
    faTrash,
    faUserPlus,
    faUserMinus,
    faFileLines,
} from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"

interface TicketCardProps {
    ticket: {
        _id: string
        ticketId: string
        guildId: string
        channelId: string
        creatorId: string
        panelId: string
        typeId: string
        status: "open" | "closed" | "locked"
        priority: "low" | "normal" | "high"
        claimedBy: string | null
        additionalUsers: string[]
        transcriptURL: string | null
        createdAt: string
        closedAt: string | null
        closedBy: string | null
    }
    panelInfo?: {
        title: string
        typeLabel: string
    }
    guildId: string
    onAction?: () => void
}

function formatTimeAgo(dateStr: string): string {
    const now = Date.now()
    const date = new Date(dateStr).getTime()
    const diff = now - date

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
}

function getPriorityConfig(priority: string) {
    switch (priority) {
        case "high":
            return {
                icon: faArrowUp,
                color: "text-red-400",
                bg: "bg-red-500/10",
                border: "border-red-500/20",
                label: "High",
            }
        case "low":
            return {
                icon: faArrowDown,
                color: "text-blue-400",
                bg: "bg-blue-500/10",
                border: "border-blue-500/20",
                label: "Low",
            }
        default:
            return {
                icon: faEquals,
                color: "text-gray-400",
                bg: "bg-gray-500/10",
                border: "border-gray-500/20",
                label: "Normal",
            }
    }
}

function getStatusConfig(status: string) {
    switch (status) {
        case "open":
            return {
                icon: faLockOpen,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
                label: "Open",
            }
        case "locked":
            return {
                icon: faLock,
                color: "text-yellow-400",
                bg: "bg-yellow-500/10",
                border: "border-yellow-500/20",
                label: "Locked",
            }
        case "closed":
            return {
                icon: faCircleXmark,
                color: "text-gray-400",
                bg: "bg-gray-500/10",
                border: "border-gray-500/20",
                label: "Closed",
            }
        default:
            return {
                icon: faCircleCheck,
                color: "text-gray-400",
                bg: "bg-gray-500/10",
                border: "border-gray-500/20",
                label: status,
            }
    }
}

export function TicketCard({ ticket, panelInfo, guildId, onAction }: TicketCardProps) {
    const statusConfig = getStatusConfig(ticket.status)
    const priorityConfig = getPriorityConfig(ticket.priority)
    const isOpen = ticket.status === "open"
    const isClosed = ticket.status === "closed"

    const [loading, setLoading] = useState<string | null>(null)
    const [confirmAction, setConfirmAction] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const performAction = async (action: string) => {
        setLoading(action)
        setError(null)
        setConfirmAction(null)

        try {
            const method = action === "delete" ? "DELETE" : "PATCH"
            let endpoint = `/api/guilds/${guildId}/tickets/${ticket._id}`

            // Different action payloads
            let body: any = null
            if (action === "close") {
                body = { status: "closed" }
            } else if (action === "reopen") {
                body = { status: "open" }
            } else if (action === "lock") {
                body = { status: "locked" }
            } else if (action === "unlock") {
                body = { status: "open" }
            } else if (action === "claim") {
                body = { claim: true }
            } else if (action === "unclaim") {
                body = { claim: false }
            }

            const res = await fetch(endpoint, {
                method,
                ...(body && {
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                }),
            })

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
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${statusConfig.bg} ${statusConfig.color}`}
                        >
                            <FontAwesomeIcon icon={faTicket} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                                Ticket #{ticket.ticketId}
                            </p>
                            {panelInfo && (
                                <p className="text-xs text-gray-500 truncate">
                                    {panelInfo.typeLabel}
                                </p>
                            )}
                        </div>
                    </div>
                    <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium flex-shrink-0 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}
                    >
                        <FontAwesomeIcon icon={statusConfig.icon} className="w-2.5 h-2.5" />
                        {statusConfig.label}
                    </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <div className={`flex items-center gap-1 ${priorityConfig.color}`}>
                            <FontAwesomeIcon icon={priorityConfig.icon} className="w-3 h-3" />
                            <span className="text-gray-400">{priorityConfig.label}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <FontAwesomeIcon icon={faUser} className="w-3 h-3 text-blue-400/60" />
                        <span>
                            {ticket.claimedBy ? "Claimed" : "Unclaimed"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <FontAwesomeIcon icon={faClock} className="w-3 h-3 text-purple-400/60" />
                        <span>{formatTimeAgo(ticket.createdAt)}</span>
                    </div>
                </div>

                {/* Additional info */}
                <div className="space-y-1.5">
                    <div className="text-[11px] text-gray-500">
                        <span className="text-gray-600">Creator:</span>{" "}
                        <span className="font-mono text-gray-400">{ticket.creatorId}</span>
                    </div>
                    {ticket.claimedBy && (
                        <div className="text-[11px] text-gray-500">
                            <span className="text-gray-600">Claimed by:</span>{" "}
                            <span className="font-mono text-gray-400">{ticket.claimedBy}</span>
                        </div>
                    )}
                    {ticket.additionalUsers.length > 0 && (
                        <div className="text-[11px] text-gray-500">
                            <span className="text-gray-600">Additional users:</span>{" "}
                            <span className="font-mono text-gray-400">
                                {ticket.additionalUsers.length}
                            </span>
                        </div>
                    )}
                    {ticket.closedAt && (
                        <div className="text-[11px] text-gray-500">
                            <span className="text-gray-600">Closed:</span>{" "}
                            <span className="text-gray-400">{formatTimeAgo(ticket.closedAt)}</span>
                        </div>
                    )}
                    {ticket.transcriptURL && (
                        <div className="text-[11px] text-gray-500 mt-2">
                            <a
                                href={ticket.transcriptURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <FontAwesomeIcon icon={faFileLines} className="w-3 h-3" />
                                View Transcript
                            </a>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && <p className="text-xs text-red-400 mt-2">⚠️ {error}</p>}
            </div>

            {/* Confirmation bar */}
            {confirmAction && (
                <div className="px-4 py-2.5 bg-red-500/5 border-t border-red-500/10">
                    <p className="text-xs text-red-300 mb-2">
                        Are you sure you want to <strong>{confirmAction}</strong> this ticket?
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
                    {isOpen && (
                        <>
                            {!ticket.claimedBy && (
                                <button
                                    onClick={() => performAction("claim")}
                                    disabled={!!loading}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                                >
                                    {loading === "claim" ? (
                                        <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <FontAwesomeIcon icon={faUserPlus} className="w-3 h-3" />
                                    )}
                                    Claim
                                </button>
                            )}
                            {ticket.claimedBy && (
                                <button
                                    onClick={() => performAction("unclaim")}
                                    disabled={!!loading}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-yellow-400 hover:bg-yellow-500/10 transition-colors disabled:opacity-50"
                                >
                                    {loading === "unclaim" ? (
                                        <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <FontAwesomeIcon icon={faUserMinus} className="w-3 h-3" />
                                    )}
                                    Unclaim
                                </button>
                            )}
                            <button
                                onClick={() => setConfirmAction("close")}
                                disabled={!!loading}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faCircleXmark} className="w-3 h-3" />
                                Close
                            </button>
                            <button
                                onClick={() => setConfirmAction("lock")}
                                disabled={!!loading}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-yellow-400 hover:bg-yellow-500/10 transition-colors disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faLock} className="w-3 h-3" />
                                Lock
                            </button>
                        </>
                    )}

                    {ticket.status === "locked" && (
                        <button
                            onClick={() => performAction("unlock")}
                            disabled={!!loading}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                        >
                            {loading === "unlock" ? (
                                <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                            ) : (
                                <FontAwesomeIcon icon={faLockOpen} className="w-3 h-3" />
                            )}
                            Unlock
                        </button>
                    )}

                    {isClosed && (
                        <button
                            onClick={() => performAction("reopen")}
                            disabled={!!loading}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                        >
                            {loading === "reopen" ? (
                                <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                            ) : (
                                <FontAwesomeIcon icon={faLockOpen} className="w-3 h-3" />
                            )}
                            Reopen
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
