"use client"

import React, { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faTicket,
    faArrowLeft,
    faSpinner,
    faPlus,
    faHashtag,
    faAlignLeft,
    faTags,
    faEdit,
    faTrash,
    faXmark,
    faPaperPlane,
    faCheck,
    faExclamationTriangle,
    faLayerGroup,
} from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"
import { toast } from "sonner"

interface TicketPanel {
    _id: string
    panelId: string
    guildId: string
    channelId: string
    title: string
    description?: string
    ticketTypes: Array<{
        typeId: string
        label: string
        emoji?: string
        description: string
        categoryId: string
        staffRoles: string[]
        maxActiveTickets: number
        cooldownMinutes: number
        logChannelId?: string
    }>
    createdAt: string
}

interface ChannelData {
    id: string
    name: string
    type?: number
}

export default function TicketsModulePage({
    params,
}: {
    params: Promise<{ guildId: string }>
}) {
    const { guildId } = React.use(params)
    const queryClient = useQueryClient()
    
    const [showCreatePanel, setShowCreatePanel] = useState(false)
    const [selectedPanel, setSelectedPanel] = useState<TicketPanel | null>(null)
    const [creating, setCreating] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)
    
    // Form state
    const [formChannel, setFormChannel] = useState("")
    const [formTitle, setFormTitle] = useState("")
    const [formDescription, setFormDescription] = useState("")
    const [createResult, setCreateResult] = useState<{
        type: "success" | "error"
        message: string
    } | null>(null)

    const { data: panels = [], isLoading: panelsLoading } = useQuery<TicketPanel[]>({
        queryKey: ["ticket-panels", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/tickets/panels`)
            if (!res.ok) throw new Error("Failed to fetch panels")
            const data = await res.json()
            return data.panels || []
        },
        enabled: !!guildId,
    })

    const { data: channels = [], isLoading: channelsLoading } = useQuery<ChannelData[]>({
        queryKey: ["channels", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/channels`)
            if (!res.ok) throw new Error("Failed to fetch channels")
            return res.json()
        },
        enabled: showCreatePanel && !!guildId,
    })

    const handleCreatePanel = async () => {
        if (!formChannel || !formTitle.trim()) {
            setCreateResult({ type: "error", message: "Channel and title are required" })
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
                toast.success("Ticket panel created successfully!")
                setFormTitle("")
                setFormDescription("")
                setFormChannel("")
                setShowCreatePanel(false)
                queryClient.invalidateQueries({ queryKey: ["ticket-panels", guildId] })
            } else {
                setCreateResult({ type: "error", message: data.error || "Failed to create panel" })
            }
        } catch {
            setCreateResult({ type: "error", message: "Network error" })
        } finally {
            setCreating(false)
        }
    }

    const handleDeletePanel = async (panelId: string) => {
        if (!confirm("Are you sure you want to delete this panel? All associated tickets will remain but the panel configuration will be lost.")) {
            return
        }

        setDeleting(panelId)
        try {
            const res = await fetch(`/api/guilds/${guildId}/tickets/panels/${panelId}`, {
                method: "DELETE",
            })

            if (res.ok) {
                toast.success("Panel deleted successfully")
                queryClient.invalidateQueries({ queryKey: ["ticket-panels", guildId] })
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to delete panel")
            }
        } catch {
            toast.error("Network error")
        } finally {
            setDeleting(null)
        }
    }

    if (panelsLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#8b5cf6] animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <Link
                        href={`/dashboard/${guildId}/modules`}
                        className="w-10 h-10 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center transition-colors border border-white/[0.06]"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 text-gray-400" />
                    </Link>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#8b5cf6]/20">
                        <FontAwesomeIcon icon={faTicket} className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Ticket Panels</h1>
                        <p className="text-gray-400 mt-1">Create and manage support ticket panels for your server</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreatePanel(!showCreatePanel)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#8b5cf6] text-white text-sm font-semibold hover:bg-[#7c3aed] transition-all shadow-lg shadow-[#8b5cf6]/20"
                >
                    <FontAwesomeIcon icon={showCreatePanel ? faXmark : faPlus} className="w-4 h-4" />
                    {showCreatePanel ? "Cancel" : "Create Panel"}
                </button>
            </motion.div>

            {/* Create Panel Form */}
            <AnimatePresence>
                {showCreatePanel && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-xl border border-[#3b82f6]/20 bg-[#3b82f6]/[0.03] p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-[#3b82f6]" />
                                Create New Ticket Panel
                            </h3>

                            <div className="space-y-4">
                                {/* Channel Selection */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5">
                                        <FontAwesomeIcon icon={faHashtag} className="w-3 h-3" />
                                        Channel <span className="text-red-400">*</span>
                                    </label>
                                    {channelsLoading ? (
                                        <div className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-gray-500 flex items-center gap-2">
                                            <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                                            Loading channels...
                                        </div>
                                    ) : (
                                        <select
                                            value={formChannel}
                                            onChange={(e) => setFormChannel(e.target.value)}
                                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/30 transition-all"
                                        >
                                            <option value="">Select a channel</option>
                                            {channels.map((ch) => (
                                                <option key={ch.id} value={ch.id}>
                                                    # {ch.name}
                                                </option>
                                            ))}
                                        </select>
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
                                        type="text"
                                        value={formTitle}
                                        onChange={(e) => setFormTitle(e.target.value)}
                                        placeholder="e.g. Support Tickets"
                                        maxLength={256}
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/30 transition-all"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5">
                                        <FontAwesomeIcon icon={faAlignLeft} className="w-3 h-3" />
                                        Description
                                    </label>
                                    <textarea
                                        value={formDescription}
                                        onChange={(e) => setFormDescription(e.target.value)}
                                        placeholder="Optional description for the ticket panel"
                                        maxLength={4000}
                                        rows={3}
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/30 transition-all resize-y"
                                    />
                                </div>

                                {/* Result Message */}
                                <AnimatePresence>
                                    {createResult && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm ${
                                                createResult.type === "success"
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

                                {/* Create Button */}
                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleCreatePanel}
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Panels List */}
            {panels.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 glass rounded-2xl border border-white/[0.06]"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                        <FontAwesomeIcon icon={faTicket} className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-400 text-lg mb-2">No ticket panels yet</p>
                    <p className="text-gray-500 text-sm">Create your first panel to get started</p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {panels.map((panel, idx) => (
                        <motion.div
                            key={panel._id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
                        >
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-1">{panel.title}</h3>
                                        {panel.description && (
                                            <p className="text-sm text-gray-400">{panel.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/dashboard/${guildId}/modules/tickets/${panel.panelId}`}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                                            Edit Panel
                                        </Link>
                                        <button
                                            onClick={() => handleDeletePanel(panel.panelId)}
                                            disabled={deleting === panel.panelId}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                        >
                                            {deleting === panel.panelId ? (
                                                <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                            )}
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-xs text-gray-500">
                                        <span className="font-medium">Panel ID:</span>{" "}
                                        <span className="font-mono">{panel.panelId}</span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        <span className="font-medium">Ticket Types:</span>{" "}
                                        <span className="font-semibold text-[#8b5cf6]">
                                            {panel.ticketTypes.length}
                                        </span>
                                    </div>
                                    {panel.ticketTypes.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {panel.ticketTypes.map((type) => (
                                                <span
                                                    key={type.typeId}
                                                    className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-xs text-gray-300"
                                                >
                                                    {type.emoji && `${type.emoji} `}
                                                    {type.label}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
