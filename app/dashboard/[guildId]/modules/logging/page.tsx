"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faClipboardList,
    faSave,
    faArrowLeft,
    faSpinner,
    faCircleCheck,
    faLayerGroup,
    faFilter,
    faBullseye
} from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"
import { ChannelPicker } from "@/components/dashboard/settings/channel-picker"
import isEqual from "lodash/isEqual"
import cloneDeep from "lodash/cloneDeep"

interface LoggingConfig {
    enabled: boolean
    mode: 'single' | 'multi' | 'granular'
    channelId: string | null
    channels: {
        moderation: string | null
        messages: string | null
        members: string | null
        server: string | null
        verification: string | null
    }
    eventChannels: {
        memberJoin: string | null
        memberLeave: string | null
        ban: string | null
        unban: string | null
        kick: string | null
        messageDelete: string | null
        messageEdit: string | null
        modCommand: string | null
        verification: string | null
        roleCreate: string | null
        roleDelete: string | null
        channelCreate: string | null
        channelDelete: string | null
    }
    events: {
        memberJoin: boolean
        memberLeave: boolean
        ban: boolean
        unban: boolean
        kick: boolean
        messageDelete: boolean
        messageEdit: boolean
        modCommand: boolean
        verification: boolean
        roleCreate: boolean
        roleDelete: boolean
        channelCreate: boolean
        channelDelete: boolean
    }
}

const EVENT_LABELS: Record<keyof LoggingConfig['events'], string> = {
    memberJoin: 'Member Join',
    memberLeave: 'Member Leave',
    ban: 'Ban',
    unban: 'Unban',
    kick: 'Kick',
    messageDelete: 'Message Delete',
    messageEdit: 'Message Edit',
    modCommand: 'Mod Command',
    verification: 'Verification',
    roleCreate: 'Role Create',
    roleDelete: 'Role Delete',
    channelCreate: 'Channel Create',
    channelDelete: 'Channel Delete'
}

export default function LoggingModulePage({
    params,
}: {
    params: Promise<{ guildId: string }>
}) {
    const { guildId } = React.use(params)
    const { data: session } = useSession()
    const [config, setConfig] = useState<LoggingConfig | null>(null)
    const [originalConfig, setOriginalConfig] = useState<LoggingConfig | null>(null)
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const hasUnsavedChanges = config && originalConfig && !isEqual(config, originalConfig)

    const { data: serverConfig, isLoading: configLoading } = useQuery({
        queryKey: ["logging", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/modules/logging`)
            if (!res.ok) throw new Error("Failed to fetch logging config")
            return res.json()
        },
        enabled: !!guildId,
    })

    useEffect(() => {
        if (serverConfig && !originalConfig) {
            setConfig(cloneDeep(serverConfig))
            setOriginalConfig(cloneDeep(serverConfig))
        }
    }, [serverConfig, originalConfig])

    const handleSave = async () => {
        if (!config) return
        setSaving(true)
        try {
            const res = await fetch(`/api/guilds/${guildId}/modules/logging`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            })
            if (res.ok) {
                setOriginalConfig(cloneDeep(config))
                setSaveSuccess(true)
                setTimeout(() => setSaveSuccess(false), 3000)
            }
        } catch (error) {
            console.error("Failed to save logging config:", error)
        } finally {
            setSaving(false)
        }
    }

    if (configLoading || !config) {
        return (
            <div className="flex items-center justify-center py-20">
                <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#8b5cf6] animate-spin" />
            </div>
        )
    }

    const EVENT_KEYS = Object.keys(EVENT_LABELS) as Array<keyof LoggingConfig['events']>

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-4 mb-8"
            >
                <div>
                    <Link
                        href={`/dashboard/${guildId}/modules`}
                        className="text-gray-400 hover:text-white mb-2 inline-flex items-center gap-2 text-sm transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
                        Back to Modules
                    </Link>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <FontAwesomeIcon icon={faClipboardList} className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Logging Module</h1>
                            <p className="text-gray-400 mt-1">
                                Monitor and track activities within your server.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={config.enabled}
                                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                            />
                            <div className={`block w-14 h-8 rounded-full transition-colors ${config.enabled ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${config.enabled ? 'transform translate-x-6' : ''}`}></div>
                        </div>
                        <div className="ml-3 text-white font-medium">
                            {config.enabled ? "Module Enabled" : "Module Disabled"}
                        </div>
                    </label>
                </div>
            </motion.div>

            {/* Main Configuration Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl border border-white/[0.06] p-6 space-y-8"
            >
                {/* Mode Selection */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white border-b border-white/[0.06] pb-2">Routing Mode</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-medium">
                        {/* Single Mode Card */}
                        <label className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col gap-2 ${config.mode === 'single' ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]' : 'bg-black/20 border-white/[0.06] hover:border-white/20'}`}>
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="logging-mode"
                                    value="single"
                                    checked={config.mode === 'single'}
                                    onChange={() => setConfig({ ...config, mode: 'single' })}
                                    className="hidden"
                                />
                                <FontAwesomeIcon icon={faFilter} className={`w-5 h-5 ${config.mode === 'single' ? 'text-[#8b5cf6]' : 'text-gray-400'}`} />
                                <span className={`text-lg ${config.mode === 'single' ? 'text-white' : 'text-gray-300'}`}>Single</span>
                            </div>
                            <p className="text-xs text-gray-400 font-normal">All events are sent to one fallback channel.</p>
                        </label>

                        {/* Multi Mode Card */}
                        <label className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col gap-2 ${config.mode === 'multi' ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]' : 'bg-black/20 border-white/[0.06] hover:border-white/20'}`}>
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="logging-mode"
                                    value="multi"
                                    checked={config.mode === 'multi'}
                                    onChange={() => setConfig({ ...config, mode: 'multi' })}
                                    className="hidden"
                                />
                                <FontAwesomeIcon icon={faLayerGroup} className={`w-5 h-5 ${config.mode === 'multi' ? 'text-[#8b5cf6]' : 'text-gray-400'}`} />
                                <span className={`text-lg ${config.mode === 'multi' ? 'text-white' : 'text-gray-300'}`}>Multi</span>
                            </div>
                            <p className="text-xs text-gray-400 font-normal">Events routed into 5 distinct categories.</p>
                        </label>

                        {/* Granular Mode Card */}
                        <label className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col gap-2 ${config.mode === 'granular' ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]' : 'bg-black/20 border-white/[0.06] hover:border-white/20'}`}>
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="logging-mode"
                                    value="granular"
                                    checked={config.mode === 'granular'}
                                    onChange={() => setConfig({ ...config, mode: 'granular' })}
                                    className="hidden"
                                />
                                <FontAwesomeIcon icon={faBullseye} className={`w-5 h-5 ${config.mode === 'granular' ? 'text-[#8b5cf6]' : 'text-gray-400'}`} />
                                <span className={`text-lg ${config.mode === 'granular' ? 'text-white' : 'text-gray-300'}`}>Granular</span>
                            </div>
                            <p className="text-xs text-gray-400 font-normal">Every 13 events can have an isolated channel.</p>
                        </label>
                    </div>
                </div>

                {/* Single Mode Setup */}
                {config.mode === 'single' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-white/[0.06]">
                        <h3 className="text-xl font-bold text-white">Log Channel</h3>
                        <p className="text-sm text-gray-400">Select the channel that will receive all bot audit logs.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <ChannelPicker
                                guildId={guildId}
                                value={config.channelId || ""}
                                onChange={(val: string | null) => setConfig({ ...config, channelId: val || null })}
                            />
                        </div>
                    </motion.div>
                )}

                {/* Multi Mode Setup */}
                {config.mode === 'multi' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-white/[0.06]">
                        <h3 className="text-xl font-bold text-white">Category Channels</h3>
                        <p className="text-sm text-gray-400">Select the logging channel for each specific category type.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-300">Moderation (Bans, Kicks, Commands)</label>
                                <ChannelPicker
                                    guildId={guildId}
                                    value={config.channels.moderation || ""}
                                    onChange={(val: string | null) => setConfig({ ...config, channels: { ...config.channels, moderation: val || null } })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-300">Messages (Deletes, Edits)</label>
                                <ChannelPicker
                                    guildId={guildId}
                                    value={config.channels.messages || ""}
                                    onChange={(val: string | null) => setConfig({ ...config, channels: { ...config.channels, messages: val || null } })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-300">Members (Joins, Leaves)</label>
                                <ChannelPicker
                                    guildId={guildId}
                                    value={config.channels.members || ""}
                                    onChange={(val: string | null) => setConfig({ ...config, channels: { ...config.channels, members: val || null } })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-300">Server (Roles, Channels)</label>
                                <ChannelPicker
                                    guildId={guildId}
                                    value={config.channels.server || ""}
                                    onChange={(val: string | null) => setConfig({ ...config, channels: { ...config.channels, server: val || null } })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-300">Verification Events</label>
                                <ChannelPicker
                                    guildId={guildId}
                                    value={config.channels.verification || ""}
                                    onChange={(val: string | null) => setConfig({ ...config, channels: { ...config.channels, verification: val || null } })}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Granular Mode Setup */}
                {config.mode === 'granular' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-white/[0.06]">
                        <h3 className="text-xl font-bold text-white">Event Custom Channels</h3>
                        <p className="text-sm text-gray-400">Override the logging channel for specific granular events.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {EVENT_KEYS.map((key) => (
                                <div key={key} className="space-y-1 bg-black/20 p-3 rounded-lg border border-white/[0.03]">
                                    <label className="block text-sm font-medium text-gray-300">{EVENT_LABELS[key]}</label>
                                    <ChannelPicker
                                        guildId={guildId}
                                        value={config.eventChannels[key] || ""}
                                        onChange={(val: string | null) => setConfig({ ...config, eventChannels: { ...config.eventChannels, [key]: val || null } })}
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Advanced Event Toggles (On/Off) */}
                <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                    <h3 className="text-xl font-bold text-white">Event Toggles</h3>
                    <p className="text-sm text-gray-400 mb-4">Turn specific events entirely on or off across your server regardless of the mode.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {EVENT_KEYS.map((key) => (
                            <label key={key} className="flex items-center justify-between cursor-pointer bg-black/20 p-3 rounded-lg border border-white/[0.03] hover:bg-black/30 transition-colors">
                                <span className="text-sm font-medium text-gray-300">{EVENT_LABELS[key]}</span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={config.events[key]}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            events: { ...config.events, [key]: e.target.checked }
                                        })}
                                    />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${config.events[key] ? 'bg-[#8b5cf6]' : 'bg-gray-700'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.events[key] ? 'transform translate-x-4' : ''}`}></div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-white/[0.06] flex flex-col gap-4">
                    <AnimatePresence mode="popLayout">
                        {hasUnsavedChanges && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
                            >
                                <p className="text-yellow-400 text-sm font-medium text-center">
                                    ⚠️ You have unsaved changes.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center justify-end gap-4 w-full">
                        {saveSuccess && (
                            <span className="text-green-400 text-sm flex items-center gap-2">
                                <FontAwesomeIcon icon={faCircleCheck} />
                                Settings saved
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving || !hasUnsavedChanges}
                            className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${hasUnsavedChanges
                                ? "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white hover:shadow-lg hover:shadow-[#8b5cf6]/20"
                                : "bg-white/[0.05] text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            {saving ? (
                                <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                            ) : (
                                <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Floating Action Bar (Mobile/Bottom) */}
            <AnimatePresence>
                {hasUnsavedChanges && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-0 left-0 right-0 lg:left-64 z-50 p-4 bg-gray-900/95 backdrop-blur-xl border-t border-white/[0.1] shadow-2xl"
                    >
                        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-yellow-400 font-medium flex items-center gap-2">
                                ⚠️ <span>You have unsaved changes in Logging</span>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setConfig(cloneDeep(originalConfig))}
                                    disabled={saving}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 sm:flex-none px-6 py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[#8b5cf6]/25 flex items-center justify-center gap-2"
                                >
                                    {saving && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
