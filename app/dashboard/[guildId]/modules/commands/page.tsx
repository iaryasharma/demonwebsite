"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faToggleOn,
    faToggleOff,
    faSave,
    faSpinner,
    faArrowLeft,
    faCheckCircle,
    faHashtag,
    faMicrophone,
    faBullhorn,
    faSearch,
} from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"

interface ChannelData {
    id: string
    name: string
    type: number // 0=text, 2=voice, 5=announcement
}

function ChannelTypeIcon({ type }: { type: number }) {
    if (type === 2) return <FontAwesomeIcon icon={faMicrophone} className="text-gray-400 w-3.5 h-3.5" />
    if (type === 5) return <FontAwesomeIcon icon={faBullhorn} className="text-gray-400 w-3.5 h-3.5" />
    return <FontAwesomeIcon icon={faHashtag} className="text-gray-400 w-3.5 h-3.5" />
}

export default function CommandStateModulePage({
    params
}: {
    params: Promise<{ guildId: string }>
}) {
    const { status } = useSession()
    const router = useRouter()
    const { guildId } = React.use(params)
    const queryClient = useQueryClient()

    // Local state: the set of disabled channel ids (mutable before save)
    const [disabledSet, setDisabledSet] = useState<Set<string>>(new Set())
    const [isDirty, setIsDirty] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [searchTerm, setSearchTerm] = useState("")

    // ─── Queries ───────────────────────────────────────────────
    const { data: channels = [], isLoading: channelsLoading } = useQuery<ChannelData[]>({
        queryKey: ["channels", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/channels`)
            if (!res.ok) throw new Error("Failed to fetch channels")
            return res.json()
        },
        enabled: status === "authenticated" && !!guildId,
        staleTime: 3 * 60 * 1000, // 3 min — reuse cached data between module navigations
    })

    const { data: commandState, isLoading: stateLoading } = useQuery<{ disabledChannels: string[] }>({
        queryKey: ["command-state", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/modules/command-state`)
            if (!res.ok) throw new Error("Failed to fetch command state")
            return res.json()
        },
        enabled: status === "authenticated" && !!guildId,
        staleTime: 60 * 1000, // 1 min
    })

    // Seed local state from server data (once loaded)
    useEffect(() => {
        if (commandState) {
            setDisabledSet(new Set(commandState.disabledChannels || []))
            setIsDirty(false)
        }
    }, [commandState])

    useEffect(() => {
        if (status === "unauthenticated") router.push("/dashboard")
    }, [status, router])

    // ─── Derived values ────────────────────────────────────────
    // Only text & announcement channels are controllable by disable (type 0 & 5)
    const textChannels = useMemo(() =>
        channels.filter(c => c.type === 0 || c.type === 5),
        [channels]
    )

    const filteredChannels = useMemo(() =>
        textChannels.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [textChannels, searchTerm]
    )

    const allEnabled = disabledSet.size === 0
    const allDisabled = textChannels.length > 0 && disabledSet.size >= textChannels.length

    // ─── Mutations ─────────────────────────────────────────────
    const saveMutation = useMutation({
        mutationFn: async (disabled: string[]) => {
            const res = await fetch(`/api/guilds/${guildId}/modules/command-state`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ disabledChannels: disabled })
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to update command state")
            }
            return res.json()
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["command-state", guildId], data)
            setIsDirty(false)
            setSuccessMessage("Channel permissions saved!")
            setTimeout(() => setSuccessMessage(""), 3000)
        }
    })

    // ─── Handlers ──────────────────────────────────────────────
    const markDirty = (newSet: Set<string>) => {
        const original = new Set(commandState?.disabledChannels || [])
        const changed = newSet.size !== original.size || [...newSet].some(id => !original.has(id)) || [...original].some(id => !newSet.has(id))
        setIsDirty(changed)
    }

    const toggleChannel = (channelId: string) => {
        setDisabledSet(prev => {
            const next = new Set(prev)
            if (next.has(channelId)) {
                next.delete(channelId) // re-enable
            } else {
                next.add(channelId) // disable
            }
            markDirty(next)
            return next
        })
    }

    const enableAll = () => {
        const next = new Set<string>()
        setDisabledSet(next)
        markDirty(next)
    }

    const disableAll = () => {
        const next = new Set(textChannels.map(c => c.id))
        setDisabledSet(next)
        markDirty(next)
    }

    const handleSave = () => {
        saveMutation.mutate([...disabledSet])
    }

    // ─── Loading state ─────────────────────────────────────────
    if (status === "loading" || channelsLoading || stateLoading) {
        return (
            <div className="min-h-[500px] flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#8b5cf6] animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href={`/dashboard/${guildId}/modules`}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FontAwesomeIcon icon={faToggleOn} className="w-8 h-8 text-[#8b5cf6]" />
                        Command State
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Enable or disable bot commands per channel.
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-grow">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search channels..."
                        className="w-full pl-11 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                    />
                </div>
                <div className="flex gap-3 shrink-0">
                    <button
                        onClick={enableAll}
                        disabled={allEnabled}
                        className="px-5 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl border border-green-500/20 transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Enable All
                    </button>
                    <button
                        onClick={disableAll}
                        disabled={allDisabled}
                        className="px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Disable All
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-4 px-1 text-sm text-gray-400">
                <span>
                    <span className="text-green-400 font-semibold">{textChannels.length - disabledSet.size}</span> enabled
                </span>
                <span>
                    <span className="text-red-400 font-semibold">{disabledSet.size}</span> disabled
                </span>
                <span className="text-gray-600">({textChannels.length} total channels)</span>
            </div>

            {/* Channel List */}
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                {filteredChannels.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        {searchTerm ? `No channels match "${searchTerm}"` : "No controllable channels found"}
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.06]">
                        {filteredChannels.map((channel, i) => {
                            const isDisabled = disabledSet.has(channel.id)
                            return (
                                <motion.div
                                    key={channel.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors group"
                                >
                                    {/* Channel info */}
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-lg flex shrink-0 items-center justify-center transition-colors ${isDisabled ? "bg-red-500/10" : "bg-white/5"}`}>
                                            <ChannelTypeIcon type={channel.type} />
                                        </div>
                                        <div>
                                            <p className={`font-medium transition-colors ${isDisabled ? "text-gray-500 line-through decoration-red-500/50" : "text-white"}`}>
                                                {channel.name}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {channel.type === 2 ? "Voice" : channel.type === 5 ? "Announcement" : "Text"} channel
                                            </p>
                                        </div>
                                    </div>

                                    {/* Toggle button */}
                                    <button
                                        onClick={() => toggleChannel(channel.id)}
                                        className="flex items-center gap-2.5 relative"
                                        title={isDisabled ? "Click to enable bot commands" : "Click to disable bot commands"}
                                    >
                                        <span className={`text-xs font-medium transition-colors ${isDisabled ? "text-red-400" : "text-green-400"}`}>
                                            {isDisabled ? "Disabled" : "Enabled"}
                                        </span>
                                        <FontAwesomeIcon
                                            icon={isDisabled ? faToggleOff : faToggleOn}
                                            className={`w-9 h-9 transition-colors ${isDisabled ? "text-gray-600 hover:text-red-400" : "text-[#8b5cf6] hover:text-[#7c3aed]"}`}
                                        />
                                    </button>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Sticky Save Bar */}
            <AnimatePresence>
                {(isDirty || successMessage || saveMutation.isPending) && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        className="fixed bottom-0 left-0 right-0 z-50"
                    >
                        <div className="mx-auto max-w-5xl px-6 pb-6 md:pl-72">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0d0d14] border border-[#8b5cf6]/40 shadow-2xl shadow-[#8b5cf6]/10 backdrop-blur-md">
                                <div className="flex items-center gap-3 text-white">
                                    {successMessage ? (
                                        <>
                                            <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-400 shrink-0" />
                                            <span className="font-medium">{successMessage}</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
                                            <span className="text-gray-300">
                                                Unsaved changes — {[...disabledSet].length} channels disabled
                                            </span>
                                        </>
                                    )}
                                </div>
                                {!successMessage && (
                                    <button
                                        onClick={handleSave}
                                        disabled={saveMutation.isPending}
                                        className="ml-4 px-6 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                                    >
                                        {saveMutation.isPending
                                            ? <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                                            : <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                                        }
                                        Save Changes
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
