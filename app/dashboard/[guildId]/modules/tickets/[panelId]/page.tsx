"use client"

import React, { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faArrowLeft,
    faSpinner,
    faSave,
    faHashtag,
    faAlignLeft,
    faTags,
    faPlus,
    faEdit,
    faTrash,
    faCheck,
    faExclamationTriangle,
    faUsers,
    faClock,
    faList,
    faSmile,
    faFolder,
} from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"
import { toast } from "sonner"

interface TicketType {
    typeId: string
    label: string
    emoji?: string
    description: string
    categoryId: string
    staffRoles: string[]
    maxActiveTickets: number
    cooldownMinutes: number
    logChannelId?: string
}

interface TicketPanel {
    _id: string
    panelId: string
    guildId: string
    channelId: string
    title: string
    description?: string
    ticketTypes: TicketType[]
    enabled: boolean
    createdAt: string
}

interface ChannelData {
    id: string
    name: string
    type?: number
    parentId?: string | null
}

export default function EditPanelPage({
    params,
}: {
    params: Promise<{ guildId: string; panelId: string }>
}) {
    const { guildId, panelId } = React.use(params)
    const queryClient = useQueryClient()

    // Form state for panel settings
    const [formTitle, setFormTitle] = useState("")
    const [formDescription, setFormDescription] = useState("")
    const [formChannel, setFormChannel] = useState("")
    const [hasChanges, setHasChanges] = useState(false)
    const [saving, setSaving] = useState(false)

    // Ticket type form state
    const [showAddType, setShowAddType] = useState(false)
    const [typeLabel, setTypeLabel] = useState("")
    const [typeEmoji, setTypeEmoji] = useState("")
    const [typeDescription, setTypeDescription] = useState("")
    const [typeCategory, setTypeCategory] = useState("")
    const [addingType, setAddingType] = useState(false)
    const [deletingType, setDeletingType] = useState<string | null>(null)

    // Fetch panel data
    const { data: panelData, isLoading: panelLoading } = useQuery<{ panel: TicketPanel }>({
        queryKey: ["ticket-panel", guildId, panelId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/tickets/panels/${panelId}`)
            if (!res.ok) throw new Error("Failed to fetch panel")
            return res.json()
        },
        enabled: !!guildId && !!panelId,
    })

    const panel = panelData?.panel

    // Initialize form when panel loads
    useEffect(() => {
        if (panel) {
            setFormTitle(panel.title)
            setFormDescription(panel.description || "")
            setFormChannel(panel.channelId)
        }
    }, [panel])

    // Detect changes
    useEffect(() => {
        if (panel) {
            const changed =
                formTitle !== panel.title ||
                formDescription !== (panel.description || "") ||
                formChannel !== panel.channelId
            setHasChanges(changed)
        }
    }, [formTitle, formDescription, formChannel, panel])

    // Fetch channels
    const { data: channels = [], isLoading: channelsLoading } = useQuery<ChannelData[]>({
        queryKey: ["channels", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/channels`)
            if (!res.ok) throw new Error("Failed to fetch channels")
            return res.json()
        },
        enabled: !!guildId,
    })

    // Separate text and category channels
    const textChannels = channels.filter((c) => c.type === 0 || !c.type)
    const categoryChannels = channels.filter((c) => c.type === 4)

    const handleSavePanel = async () => {
        if (!formTitle.trim()) {
            toast.error("Title is required")
            return
        }

        setSaving(true)
        try {
            const res = await fetch(`/api/guilds/${guildId}/tickets/panels/${panelId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formTitle.trim(),
                    description: formDescription.trim() || null,
                    channelId: formChannel,
                }),
            })

            if (res.ok) {
                toast.success("Panel updated successfully!")
                setHasChanges(false)
                queryClient.invalidateQueries({ queryKey: ["ticket-panel", guildId, panelId] })
                queryClient.invalidateQueries({ queryKey: ["ticket-panels", guildId] })
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to update panel")
            }
        } catch {
            toast.error("Network error")
        } finally {
            setSaving(false)
        }
    }

    const handleAddType = async () => {
        if (!typeLabel.trim() || !typeCategory) {
            toast.error("Label and category are required")
            return
        }

        setAddingType(true)
        try {
            const res = await fetch(`/api/guilds/${guildId}/tickets/panels/${panelId}/types`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    label: typeLabel.trim(),
                    emoji: typeEmoji.trim() || null,
                    description: typeDescription.trim() || "No description",
                    categoryId: typeCategory,
                    staffRoles: [],
                    maxActiveTickets: 1,
                    cooldownMinutes: 0,
                }),
            })

            if (res.ok) {
                toast.success("Ticket type added!")
                setTypeLabel("")
                setTypeEmoji("")
                setTypeDescription("")
                setTypeCategory("")
                setShowAddType(false)
                queryClient.invalidateQueries({ queryKey: ["ticket-panel", guildId, panelId] })
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to add type")
            }
        } catch {
            toast.error("Network error")
        } finally {
            setAddingType(false)
        }
    }

    const handleDeleteType = async (typeId: string) => {
        if (!confirm("Are you sure you want to delete this ticket type?")) {
            return
        }

        setDeletingType(typeId)
        try {
            const res = await fetch(
                `/api/guilds/${guildId}/tickets/panels/${panelId}/types/${typeId}`,
                { method: "DELETE" }
            )

            if (res.ok) {
                toast.success("Ticket type deleted")
                queryClient.invalidateQueries({ queryKey: ["ticket-panel", guildId, panelId] })
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to delete type")
            }
        } catch {
            toast.error("Network error")
        } finally {
            setDeletingType(null)
        }
    }

    if (panelLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#8b5cf6] animate-spin" />
            </div>
        )
    }

    if (!panel) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-400">Panel not found</p>
                <Link
                    href={`/dashboard/${guildId}/modules/tickets`}
                    className="text-[#8b5cf6] hover:underline mt-4 inline-block"
                >
                    Back to Tickets
                </Link>
            </div>
        )
    }

    const inputClass =
        "w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/30 transition-all"

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/dashboard/${guildId}/modules/tickets`}
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Edit Ticket Panel</h1>
                        <p className="text-sm text-gray-400 mt-1">Configure panel settings and ticket types</p>
                    </div>
                </div>

                {/* Save button */}
                <AnimatePresence>
                    {hasChanges && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={handleSavePanel}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-[#8b5cf6]/20"
                        >
                            {saving ? (
                                <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                            ) : (
                                <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                            )}
                            Save Changes
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Panel Settings */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
            >
                <h2 className="text-lg font-semibold text-white mb-4">Panel Settings</h2>

                <div className="space-y-4">
                    {/* Channel */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-2">
                            <FontAwesomeIcon icon={faHashtag} className="w-3.5 h-3.5" />
                            Channel <span className="text-red-400">*</span>
                        </label>
                        {channelsLoading ? (
                            <div className="h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center px-3">
                                <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 text-gray-500 animate-spin" />
                                <span className="ml-2 text-sm text-gray-500">Loading channels...</span>
                            </div>
                        ) : (
                            <select
                                className={inputClass}
                                value={formChannel}
                                onChange={(e) => setFormChannel(e.target.value)}
                            >
                                <option value="">Select a channel...</option>
                                {textChannels.map((ch) => (
                                    <option key={ch.id} value={ch.id}>
                                        # {ch.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <p className="text-xs text-gray-500 mt-1.5">
                            Where the ticket panel message will be posted
                        </p>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-2">
                            <FontAwesomeIcon icon={faTags} className="w-3.5 h-3.5" />
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

                    {/* Description */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-2">
                            <FontAwesomeIcon icon={faAlignLeft} className="w-3.5 h-3.5" />
                            Description
                        </label>
                        <textarea
                            className={`${inputClass} min-h-[100px] resize-y`}
                            placeholder="Optional description for the ticket panel"
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            maxLength={4000}
                        />
                        <p className="text-xs text-gray-500 mt-1.5">
                            This will be shown in the ticket panel embed
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Ticket Types */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Ticket Types</h2>
                    <button
                        onClick={() => setShowAddType(!showAddType)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium transition-all"
                    >
                        <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
                        Add Type
                    </button>
                </div>

                {/* Add Type Form */}
                <AnimatePresence>
                    {showAddType && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-4"
                        >
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.03] p-4 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Label */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5">
                                            <FontAwesomeIcon icon={faTags} className="w-3 h-3" />
                                            Label <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            className={inputClass}
                                            placeholder="e.g. General Support"
                                            value={typeLabel}
                                            onChange={(e) => setTypeLabel(e.target.value)}
                                            maxLength={100}
                                        />
                                    </div>

                                    {/* Emoji */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5">
                                            <FontAwesomeIcon icon={faSmile} className="w-3 h-3" />
                                            Emoji
                                        </label>
                                        <input
                                            className={inputClass}
                                            placeholder="e.g. 🎫 or :ticket:"
                                            value={typeEmoji}
                                            onChange={(e) => setTypeEmoji(e.target.value)}
                                            maxLength={50}
                                        />
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5">
                                        <FontAwesomeIcon icon={faFolder} className="w-3 h-3" />
                                        Category <span className="text-red-400">*</span>
                                    </label>
                                    {channelsLoading ? (
                                        <div className={inputClass}>Loading...</div>
                                    ) : (
                                        <select
                                            className={inputClass}
                                            value={typeCategory}
                                            onChange={(e) => setTypeCategory(e.target.value)}
                                        >
                                            <option value="">Select a category...</option>
                                            {categoryChannels.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    📁 {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    <p className="text-[10px] text-gray-600 mt-1">
                                        Ticket channels will be created under this category
                                    </p>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5">
                                        <FontAwesomeIcon icon={faAlignLeft} className="w-3 h-3" />
                                        Description
                                    </label>
                                    <input
                                        className={inputClass}
                                        placeholder="Short description of this ticket type"
                                        value={typeDescription}
                                        onChange={(e) => setTypeDescription(e.target.value)}
                                        maxLength={100}
                                    />
                                </div>

                                {/* Add Button */}
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        onClick={() => setShowAddType(false)}
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/[0.06] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddType}
                                        disabled={addingType || !typeLabel.trim() || !typeCategory}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-all disabled:opacity-50"
                                    >
                                        {addingType ? (
                                            <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                                        )}
                                        Add Type
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Types List */}
                {panel.ticketTypes.length === 0 ? (
                    <div className="text-center py-12 rounded-lg border border-dashed border-white/[0.06]">
                        <FontAwesomeIcon icon={faList} className="w-8 h-8 text-gray-600 mb-3" />
                        <p className="text-gray-400 text-sm">No ticket types yet</p>
                        <p className="text-gray-500 text-xs mt-1">Add a type to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {panel.ticketTypes.map((type, idx) => (
                            <motion.div
                                key={type.typeId}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {type.emoji && <span className="text-lg">{type.emoji}</span>}
                                            <h3 className="text-base font-semibold text-white">{type.label}</h3>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-2">{type.description}</p>
                                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <FontAwesomeIcon icon={faFolder} className="w-3 h-3" />
                                                Category: {type.categoryId}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FontAwesomeIcon icon={faList} className="w-3 h-3" />
                                                Max: {type.maxActiveTickets}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                                                Cooldown: {type.cooldownMinutes}m
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteType(type.typeId)}
                                        disabled={deletingType === type.typeId}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                    >
                                        {deletingType === type.typeId ? (
                                            <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    )
}
