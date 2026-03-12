"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faTicket,
    faSpinner,
    faLockOpen,
    faLock,
    faCircleXmark,
    faBoxOpen,
    faRotateRight,
    faPlus,
    faXmark,
    faHashtag,
    faAlignLeft,
    faPaperPlane,
    faCheck,
    faExclamationTriangle,
    faLayerGroup,
    faTags,
    faCircleInfo,
    faCubes,
} from "@fortawesome/free-solid-svg-icons"
import { TicketCard } from "@/components/dashboard/ticket-card"

type FilterType = "all" | "open" | "closed" | "locked"

interface TicketData {
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

interface TicketEnrichedData extends TicketData {
    panelInfo?: {
        title: string
        typeLabel: string
    }
}

interface ChannelData {
    id: string
    name: string
    position: number
    parentId: string | null
}

interface TicketStatsData {
    tickets: TicketEnrichedData[]
    stats: {
        total: number
        open: number
        closed: number
        locked: number
        claimed: number
        high: number
        normal: number
        low: number
    }
}

export default function TicketsPage() {
    const { data: session } = useSession()
    const params = useParams()
    const guildId = params?.guildId as string

    const [filter, setFilter] = useState<FilterType>("all")

    // Creation form state
    const [showCreate, setShowCreate] = useState(false)
    const [creating, setCreating] = useState(false)
    const [createResult, setCreateResult] = useState<{
        type: "success" | "error"
        message: string
    } | null>(null)

    // Form fields
    const [formChannel, setFormChannel] = useState("")
    const [formTitle, setFormTitle] = useState("")
    const [formDescription, setFormDescription] = useState("")

    // Custom dropdown state
    const [channelDropdownOpen, setChannelDropdownOpen] = useState(false)
    const channelDropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (channelDropdownRef.current && !channelDropdownRef.current.contains(e.target as Node)) {
                setChannelDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const {
        data: ticketData,
        isLoading: loading,
        refetch: refetchTickets,
    } = useQuery<TicketStatsData>({
        queryKey: ["tickets", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/tickets`)
            if (!res.ok) throw new Error("Failed to fetch tickets")
            return res.json()
        },
        enabled: !!session && !!guildId,
    })

    const tickets = ticketData?.tickets || []
    const stats = ticketData?.stats || {
        total: 0,
        open: 0,
        closed: 0,
        locked: 0,
        claimed: 0,
        high: 0,
        normal: 0,
        low: 0,
    }

    const queryClient = useQueryClient()

    const {
        data: channels = [],
        isLoading: channelsLoading,
        isFetching: channelsFetching,
        refetch: refetchChannels,
    } = useQuery<ChannelData[]>({
        queryKey: ["channels", guildId],
        queryFn: async ({ meta }) => {
            const forceRefresh = meta?.forceRefresh === true
            const url = forceRefresh
                ? `/api/guilds/${guildId}/channels?refresh=true`
                : `/api/guilds/${guildId}/channels`
            const res = await fetch(url)
            if (!res.ok) throw new Error("Failed to fetch channels")
            return res.json()
        },
        enabled: showCreate && !!guildId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const handleRefreshChannels = () => {
        queryClient.invalidateQueries({ queryKey: ["channels", guildId] })
        refetchChannels({ meta: { forceRefresh: true } } as any)
    }

    useEffect(() => {
        // Set first text channel as default
        const textChannels = channels.filter((c) => !c.parentId || c.name !== "─")
        if (textChannels.length > 0 && !formChannel) {
            setFormChannel(textChannels[0].id)
        }
    }, [channels, formChannel])

    const handleRefresh = async () => {
        await refetchTickets()
    }

    const handleCreate = async () => {
        if (!formChannel || !formTitle.trim()) {
            setCreateResult({
                type: "error",
                message: "Channel and title are required",
            })
            return
        }

        setCreating(true)
        setCreateResult(null)

        try {
            const res = await fetch(`/api/guilds/${guildId}/tickets/panels`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    channelId: formChannel,
                    title: formTitle.trim(),
                    description: formDescription.trim() || null,
                }),
            })

            const data = await res.json()

            if (res.ok) {
                setCreateResult({ type: "success", message: "Panel created successfully!" })
                // Reset form
                setFormTitle("")
                setFormDescription("")
                // Refresh list
                await refetchTickets()
                // Close form after 2 seconds
                setTimeout(() => {
                    setShowCreate(false)
                    setCreateResult(null)
                }, 2000)
            } else {
                setCreateResult({ type: "error", message: data.error || "Failed to create panel" })
            }
        } catch {
            setCreateResult({ type: "error", message: "Network error" })
        } finally {
            setCreating(false)
        }
    }

    const filtered = tickets.filter((t) => {
        if (filter === "open") return t.status === "open"
        if (filter === "closed") return t.status === "closed"
        if (filter === "locked") return t.status === "locked"
        return true
    })

    const filters: { id: FilterType; label: string; count: number; icon: any }[] = [
        { id: "all", label: "All", count: stats.total, icon: faTicket },
        { id: "open", label: "Open", count: stats.open, icon: faLockOpen },
        { id: "closed", label: "Closed", count: stats.closed, icon: faCircleXmark },
        { id: "locked", label: "Locked", count: stats.locked, icon: faLock },
    ]

    const inputClass =
        "w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/30 transition-all"

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FontAwesomeIcon icon={faTicket} className="w-6 h-6 text-[#8b5cf6]" />
                        Tickets
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Manage all ticket panels and active tickets in your server
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] text-gray-300 text-sm font-medium hover:bg-white/[0.1] hover:text-white transition-all disabled:opacity-50"
                    >
                        <FontAwesomeIcon
                            icon={faRotateRight}
                            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Creation Form (Hidden - Use Modules instead) */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/[0.03] p-5 space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-[#8b5cf6]" />
                                Create New Ticket Panel
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Channel */}
                                <div>
                                    <label className="flex items-center justify-between mb-1.5">
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                            <FontAwesomeIcon icon={faHashtag} className="w-3 h-3" />
                                            Channel <span className="text-red-400">*</span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleRefreshChannels}
                                            disabled={channelsFetching}
                                            title="Refresh channel list"
                                            className="p-1 rounded-lg text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-40"
                                        >
                                            <FontAwesomeIcon
                                                icon={faRotateRight}
                                                className={`w-3 h-3 ${channelsFetching ? "animate-spin" : ""}`}
                                            />
                                        </button>
                                    </label>
                                    {channelsLoading ? (
                                        <div className={`${inputClass} flex items-center gap-2 text-gray-500`}>
                                            <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                                            Loading channels...
                                        </div>
                                    ) : (
                                        <div ref={channelDropdownRef} className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setChannelDropdownOpen(!channelDropdownOpen)}
                                                className={`${inputClass} flex items-center justify-between text-left`}
                                            >
                                                <span className={formChannel ? "text-white" : "text-gray-500"}>
                                                    {formChannel
                                                        ? `# ${channels.find((c) => c.id === formChannel)?.name || "Unknown"
                                                        }`
                                                        : "Select a channel"}
                                                </span>
                                                <svg
                                                    className={`w-4 h-4 text-gray-400 transition-transform ${channelDropdownOpen ? "rotate-180" : ""
                                                        }`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </button>
                                            {channelDropdownOpen && (
                                                <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-white/[0.1] bg-[#1a1b1e] shadow-xl shadow-black/40">
                                                    {channels.map((ch) => (
                                                        <button
                                                            key={ch.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormChannel(ch.id)
                                                                setChannelDropdownOpen(false)
                                                            }}
                                                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${formChannel === ch.id
                                                                    ? "bg-[#3b82f6]/15 text-[#60a5fa]"
                                                                    : "text-gray-300 hover:bg-white/[0.06] hover:text-white"
                                                                }`}
                                                        >
                                                            <span className="text-gray-500 text-xs">#</span>
                                                            {ch.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-[10px] text-gray-600 mt-1">
                                        Where to send the ticket panel message
                                    </p>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5">
                                        <FontAwesomeIcon icon={faTags} className="w-3 h-3" />
                                        Panel Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        className={inputClass}
                                        placeholder="e.g. Support Tickets"
                                        value={formTitle}
                                        onChange={(e) => setFormTitle(e.target.value)}
                                        maxLength={256}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5">
                                    <FontAwesomeIcon icon={faAlignLeft} className="w-3 h-3" />
                                    Description
                                </label>
                                <textarea
                                    className={`${inputClass} min-h-[80px] resize-y`}
                                    placeholder="Optional description for the ticket panel"
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    maxLength={4000}
                                />
                                <p className="text-[10px] text-gray-600 mt-1">
                                    This will be shown in the ticket panel embed
                                </p>
                            </div>

                            {/* Create result */}
                            <AnimatePresence>
                                {createResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm ${createResult.type === "success"
                                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                                : "bg-red-500/10 border border-red-500/20 text-red-400"
                                            }`}
                                    >
                                        <FontAwesomeIcon
                                            icon={createResult.type === "success" ? faCheck : faExclamationTriangle}
                                            className="w-3.5 h-3.5"
                                        />
                                        {createResult.message}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Create button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCreate}
                                    disabled={creating || !formChannel || !formTitle.trim()}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#8b5cf6] text-white text-sm font-semibold hover:bg-[#7c3aed] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#8b5cf6]/20"
                                >
                                    {creating ? (
                                        <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                                    )}
                                    Create Panel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info Banner - Direct to Modules */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-blue-500/20 bg-blue-500/[0.05] p-4"
            >
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <FontAwesomeIcon icon={faCircleInfo} className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-white mb-1">Manage Ticket Panels</h3>
                        <p className="text-sm text-gray-400 mb-3">
                            To create, edit, or configure ticket panels and their types, use the dedicated Tickets module.
                        </p>
                        <Link
                            href={`/dashboard/${guildId}/modules/tickets`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium transition-all"
                        >
                            <FontAwesomeIcon icon={faCubes} className="w-3.5 h-3.5" />
                            Go to Tickets Module
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-gray-400 mt-1">Total Tickets</p>
                </div>
                <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02]">
                    <p className="text-2xl font-bold text-emerald-400">{stats.open}</p>
                    <p className="text-xs text-gray-400 mt-1">Open</p>
                </div>
                <div className="p-4 rounded-xl border border-yellow-500/10 bg-yellow-500/[0.02]">
                    <p className="text-2xl font-bold text-yellow-400">{stats.locked}</p>
                    <p className="text-xs text-gray-400 mt-1">Locked</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <p className="text-2xl font-bold text-gray-400">{stats.closed}</p>
                    <p className="text-xs text-gray-400 mt-1">Closed</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                {filters.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center ${filter === f.id
                                ? "bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/20"
                                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                            }`}
                    >
                        <FontAwesomeIcon icon={f.icon} className="w-3.5 h-3.5" />
                        {f.label}
                        <span
                            className={`ml-1 text-[11px] px-1.5 py-0.5 rounded-full ${filter === f.id ? "bg-white/20" : "bg-white/[0.06]"
                                }`}
                        >
                            {f.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Ticket List */}
            {loading ? (
                <div className="text-center py-16 text-gray-500">
                    <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 animate-spin mb-3" />
                    <p className="text-sm">Loading tickets...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <FontAwesomeIcon icon={faBoxOpen} className="w-8 h-8 mb-3 text-gray-600" />
                    <p className="text-sm">
                        {filter === "all"
                            ? "No tickets found. Create a panel to get started!"
                            : `No ${filter} tickets found.`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((ticket, idx) => (
                        <motion.div
                            key={ticket._id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <TicketCard
                                ticket={ticket}
                                panelInfo={ticket.panelInfo}
                                guildId={guildId}
                                onAction={handleRefresh}
                            />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
