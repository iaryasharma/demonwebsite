"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faGift,
    faSpinner,
    faCircleCheck,
    faCircleXmark,
    faBoxOpen,
    faRotateRight,
    faPlus,
    faXmark,
    faHashtag,
    faTrophy,
    faClock,
    faAlignLeft,
    faUserShield,
    faPaperPlane,
    faCheck,
    faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons"
import { GiveawayCard } from "@/components/dashboard/giveaway-card"

type FilterType = "all" | "active" | "ended"

interface GiveawayData {
    _id: string
    messageId: string
    channelId: string
    guildId: string
    hostId: string
    prize: string
    description: string | null
    requiredRole: string | null
    winnerCount: number
    duration: number
    startTime: string
    endTime: string
    participants: string[]
    winners: string[]
    isActive: boolean
    isEnded: boolean
    endedAt: string | null
    endedBy: string | null
}

interface ChannelData {
    id: string
    name: string
    position: number
    parentId: string | null
}

interface RoleData {
    id: string
    name: string
    color: string | null
    position: number
}

export default function GiveawaysPage() {
    const { data: session } = useSession()
    const params = useParams()
    const guildId = params?.guildId as string

    const [giveaways, setGiveaways] = useState<GiveawayData[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<FilterType>("all")

    // Creation form state
    const [showCreate, setShowCreate] = useState(false)
    const [channels, setChannels] = useState<ChannelData[]>([])
    const [roles, setRoles] = useState<RoleData[]>([])
    const [channelsLoading, setChannelsLoading] = useState(false)
    const [rolesLoading, setRolesLoading] = useState(false)
    const [creating, setCreating] = useState(false)
    const [createResult, setCreateResult] = useState<{
        type: "success" | "error"
        message: string
    } | null>(null)

    // Form fields
    const [formChannel, setFormChannel] = useState("")
    const [formPrize, setFormPrize] = useState("")
    const [formDescription, setFormDescription] = useState("")
    const [formDuration, setFormDuration] = useState("")
    const [formWinnerCount, setFormWinnerCount] = useState("1")
    const [formRequiredRole, setFormRequiredRole] = useState("")

    // Custom dropdown state
    const [channelDropdownOpen, setChannelDropdownOpen] = useState(false)
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
    const channelDropdownRef = useRef<HTMLDivElement>(null)
    const roleDropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (channelDropdownRef.current && !channelDropdownRef.current.contains(e.target as Node)) {
                setChannelDropdownOpen(false)
            }
            if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
                setRoleDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const fetchGiveaways = useCallback(async () => {
        try {
            const res = await fetch(`/api/guilds/${guildId}/giveaways`)
            if (res.ok) {
                const data = await res.json()
                setGiveaways(data)
            }
        } catch (error) {
            console.error("Error fetching giveaways:", error)
        } finally {
            setLoading(false)
        }
    }, [guildId])

    const fetchChannels = useCallback(async () => {
        setChannelsLoading(true)
        try {
            const res = await fetch(`/api/guilds/${guildId}/channels`)
            if (res.ok) {
                const data = await res.json()
                setChannels(data)
                if (data.length > 0 && !formChannel) {
                    setFormChannel(data[0].id)
                }
            }
        } catch (error) {
            console.error("Error fetching channels:", error)
        } finally {
            setChannelsLoading(false)
        }
    }, [guildId, formChannel])

    const fetchRoles = useCallback(async () => {
        setRolesLoading(true)
        try {
            const res = await fetch(`/api/guilds/${guildId}/roles`)
            if (res.ok) {
                const data = await res.json()
                setRoles(data)
            }
        } catch (error) {
            console.error("Error fetching roles:", error)
        } finally {
            setRolesLoading(false)
        }
    }, [guildId])

    useEffect(() => {
        if (session && guildId) fetchGiveaways()
    }, [session, guildId, fetchGiveaways])

    useEffect(() => {
        if (showCreate && channels.length === 0) fetchChannels()
        if (showCreate && roles.length === 0) fetchRoles()
    }, [showCreate, channels.length, roles.length, fetchChannels, fetchRoles])

    const handleRefresh = async () => {
        setLoading(true)
        await fetchGiveaways()
    }

    const handleCreate = async () => {
        if (!formChannel || !formPrize.trim() || !formDuration.trim()) {
            setCreateResult({ type: "error", message: "Channel, prize, and duration are required" })
            return
        }

        setCreating(true)
        setCreateResult(null)

        try {
            const res = await fetch(`/api/guilds/${guildId}/giveaways/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    channelId: formChannel,
                    prize: formPrize.trim(),
                    description: formDescription.trim() || null,
                    duration: formDuration.trim(),
                    winnerCount: formWinnerCount,
                    requiredRole: formRequiredRole.trim() || null,
                }),
            })

            const data = await res.json()

            if (res.ok) {
                setCreateResult({ type: "success", message: data.message })
                // Reset form
                setFormPrize("")
                setFormDescription("")
                setFormDuration("")
                setFormWinnerCount("1")
                setFormRequiredRole("")
                // Refresh list
                await fetchGiveaways()
                // Close form after 2 seconds
                setTimeout(() => {
                    setShowCreate(false)
                    setCreateResult(null)
                }, 2000)
            } else {
                setCreateResult({ type: "error", message: data.error || "Failed to create giveaway" })
            }
        } catch {
            setCreateResult({ type: "error", message: "Network error" })
        } finally {
            setCreating(false)
        }
    }

    const filtered = giveaways.filter((g) => {
        if (filter === "active") return g.isActive && !g.isEnded
        if (filter === "ended") return g.isEnded
        return true
    })

    const activeCount = giveaways.filter((g) => g.isActive && !g.isEnded).length
    const endedCount = giveaways.filter((g) => g.isEnded).length

    const filters: { id: FilterType; label: string; count: number; icon: any }[] = [
        { id: "all", label: "All", count: giveaways.length, icon: faGift },
        { id: "active", label: "Active", count: activeCount, icon: faCircleCheck },
        { id: "ended", label: "Ended", count: endedCount, icon: faCircleXmark },
    ]

    const inputClass =
        "w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/30 transition-all"

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FontAwesomeIcon icon={faGift} className="w-6 h-6 text-[#8b5cf6]" />
                        Giveaways
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Manage all giveaways running in your server
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
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#8b5cf6] text-white text-sm font-semibold hover:bg-[#7c3aed] transition-all shadow-lg shadow-[#8b5cf6]/20"
                    >
                        <FontAwesomeIcon icon={showCreate ? faXmark : faPlus} className="w-3.5 h-3.5" />
                        {showCreate ? "Cancel" : "Create Giveaway"}
                    </button>
                </div>
            </div>

            {/* Creation Form */}
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
                                <FontAwesomeIcon icon={faGift} className="w-4 h-4 text-[#8b5cf6]" />
                                Create New Giveaway
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Channel */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5">
                                        <FontAwesomeIcon icon={faHashtag} className="w-3 h-3" />
                                        Channel <span className="text-red-400">*</span>
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
                                                        ? `# ${channels.find(c => c.id === formChannel)?.name || "Unknown"}`
                                                        : "Select a channel"}
                                                </span>
                                                <svg className={`w-4 h-4 text-gray-400 transition-transform ${channelDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                                                                    ? "bg-[#8b5cf6]/15 text-[#a78bfa]"
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
                                </div>

                                {/* Prize */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5">
                                        <FontAwesomeIcon icon={faGift} className="w-3 h-3" />
                                        Prize <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        className={inputClass}
                                        placeholder="e.g. Discord Nitro"
                                        value={formPrize}
                                        onChange={(e) => setFormPrize(e.target.value)}
                                        maxLength={256}
                                    />
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5">
                                        <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                                        Duration <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        className={inputClass}
                                        placeholder="e.g. 1d, 2h30m, 7d"
                                        value={formDuration}
                                        onChange={(e) => setFormDuration(e.target.value)}
                                    />
                                    <p className="text-[10px] text-gray-600 mt-1">
                                        s=seconds, m=minutes, h=hours, d=days, w=weeks
                                    </p>
                                </div>

                                {/* Winner Count */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5">
                                        <FontAwesomeIcon icon={faTrophy} className="w-3 h-3" />
                                        Winners
                                    </label>
                                    <input
                                        type="number"
                                        className={inputClass}
                                        placeholder="1"
                                        value={formWinnerCount}
                                        onChange={(e) => setFormWinnerCount(e.target.value)}
                                        min={1}
                                        max={50}
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
                                    placeholder="Optional description for the giveaway"
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    maxLength={1000}
                                />
                            </div>

                            {/* Required Role */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5">
                                    <FontAwesomeIcon icon={faUserShield} className="w-3 h-3" />
                                    Required Role
                                </label>
                                {rolesLoading ? (
                                    <div className={`${inputClass} flex items-center gap-2 text-gray-500`}>
                                        <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                                        Loading roles...
                                    </div>
                                ) : (
                                    <div ref={roleDropdownRef} className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                                            className={`${inputClass} flex items-center justify-between text-left`}
                                        >
                                            <span className={formRequiredRole ? "text-white flex items-center gap-2" : "text-gray-500"}>
                                                {formRequiredRole ? (
                                                    <>
                                                        <span
                                                            className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                                                            style={{ backgroundColor: roles.find(r => r.id === formRequiredRole)?.color || "#99aab5" }}
                                                        />
                                                        {roles.find(r => r.id === formRequiredRole)?.name || "Unknown"}
                                                    </>
                                                ) : "No requirement (everyone)"}
                                            </span>
                                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${roleDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {roleDropdownOpen && (
                                            <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-white/[0.1] bg-[#1a1b1e] shadow-xl shadow-black/40">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormRequiredRole("")
                                                        setRoleDropdownOpen(false)
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${!formRequiredRole
                                                            ? "bg-[#8b5cf6]/15 text-[#a78bfa]"
                                                            : "text-gray-300 hover:bg-white/[0.06] hover:text-white"
                                                        }`}
                                                >
                                                    No requirement (everyone)
                                                </button>
                                                {roles.map((role) => (
                                                    <button
                                                        key={role.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormRequiredRole(role.id)
                                                            setRoleDropdownOpen(false)
                                                        }}
                                                        className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${formRequiredRole === role.id
                                                                ? "bg-[#8b5cf6]/15 text-[#a78bfa]"
                                                                : "text-gray-300 hover:bg-white/[0.06] hover:text-white"
                                                            }`}
                                                    >
                                                        <span
                                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: role.color || "#99aab5" }}
                                                        />
                                                        {role.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <p className="text-[10px] text-gray-600 mt-1">
                                    Only users with this role can enter. Leave empty for everyone.
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
                                    disabled={creating || !formChannel || !formPrize.trim() || !formDuration.trim()}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#8b5cf6] text-white text-sm font-semibold hover:bg-[#7c3aed] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#8b5cf6]/20"
                                >
                                    {creating ? (
                                        <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                                    )}
                                    Create Giveaway
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <p className="text-2xl font-bold text-white">{giveaways.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Total Giveaways</p>
                </div>
                <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02]">
                    <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
                    <p className="text-xs text-gray-400 mt-1">Active</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <p className="text-2xl font-bold text-gray-400">{endedCount}</p>
                    <p className="text-xs text-gray-400 mt-1">Ended</p>
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

            {/* Giveaway List */}
            {loading ? (
                <div className="text-center py-16 text-gray-500">
                    <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 animate-spin mb-3" />
                    <p className="text-sm">Loading giveaways...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <FontAwesomeIcon icon={faBoxOpen} className="w-8 h-8 mb-3 text-gray-600" />
                    <p className="text-sm">
                        {filter === "all"
                            ? "No giveaways found. Create one to get started!"
                            : `No ${filter} giveaways found.`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((giveaway, idx) => (
                        <motion.div
                            key={giveaway._id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <GiveawayCard
                                giveaway={giveaway}
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
