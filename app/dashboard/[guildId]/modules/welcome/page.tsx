"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faDoorOpen,
    faSave,
    faArrowLeft,
    faSpinner,
    faCircleCheck,
    faCircleInfo,
    faArrowUpRightFromSquare,
    faHashtag
} from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"
import { ChannelPicker } from "@/components/dashboard/settings/channel-picker"
import isEqual from "lodash/isEqual"
import cloneDeep from "lodash/cloneDeep"
import { SaveBar } from "@/components/dashboard/save-bar"

interface WelcomeConfig {
    enabled: boolean
    channelId: string | null
    message: string
    embedEnabled: boolean
    embedColor: string
    embedTitle: string
    embedDescription: string
    embedImage: string | null
    embedThumbnail: boolean
    embedFooter: string
    dmEnabled: boolean
    dmMessage: string
    imageEnabled: boolean
    imageTemplate: string
    embedChannelId: string | null
    plainEnabled: boolean
    plainChannelId: string | null
}

import { toast } from "sonner"

export default function WelcomeModulePage({
    params,
}: {
    params: Promise<{ guildId: string }>
}) {
    const { guildId } = React.use(params)
    const { data: session } = useSession()
    const [config, setConfig] = useState<WelcomeConfig | null>(null)
    const [originalConfig, setOriginalConfig] = useState<WelcomeConfig | null>(null)
    const [saving, setSaving] = useState(false)

    const hasUnsavedChanges = config && originalConfig && !isEqual(config, originalConfig)

    const { data: serverConfig, isLoading: configLoading } = useQuery({
        queryKey: ["welcome", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/modules/welcome`)
            if (!res.ok) throw new Error("Failed to fetch welcome config")
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
            const res = await fetch(`/api/guilds/${guildId}/modules/welcome`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            })
            if (res.ok) {
                setOriginalConfig(cloneDeep(config))
                toast.success("Welcome settings saved!")
            } else {
                toast.error("Failed to save welcome settings")
            }
        } catch (error) {
            console.error("Failed to save welcome config:", error)
            toast.error("An error occurred while saving")
        } finally {
            setSaving(false)
        }
    }

    const handleDiscard = () => {
        if (originalConfig) {
            setConfig(cloneDeep(originalConfig))
        }
    }

    if (configLoading || !config) {
        return (
            <div className="flex items-center justify-center py-20">
                <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#8b5cf6] animate-spin" />
            </div>
        )
    }

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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                            <FontAwesomeIcon icon={faDoorOpen} className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Welcome Module</h1>
                            <p className="text-gray-400 mt-1">
                                Greet new members when they join the server.
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
                {/* General Settings */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white border-b border-white/[0.06] pb-2">General Settings</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Main Channel</label>
                            <ChannelPicker
                                guildId={guildId}
                                value={config.channelId || ""}
                                onChange={(val: string | null) => setConfig({ ...config, channelId: val || null })}
                            />
                            <p className="text-xs text-gray-500 mt-1">Fallback channel for embeds when no separate embed channel is set.</p>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-300">Plain Text Message</label>
                            <label className="flex items-center cursor-pointer gap-2">
                                <span className="text-xs text-gray-400">Enable Plain</span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={config.plainEnabled}
                                        onChange={(e) => setConfig({ ...config, plainEnabled: e.target.checked })}
                                    />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${config.plainEnabled ? 'bg-[#8b5cf6]' : 'bg-gray-700'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.plainEnabled ? 'transform translate-x-4' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                        <textarea
                            value={config.message}
                            onChange={(e) => setConfig({ ...config, message: e.target.value })}
                            className="w-full h-32 bg-black/50 border border-white/[0.06] rounded-xl p-4 text-white focus:outline-none focus:border-[#8b5cf6]/50 transition-colors"
                            placeholder="Welcome {user} to {server}!"
                        />
                        <p className="text-xs text-gray-500 mt-1">Variables: <code className="bg-white/10 px-1 rounded text-gray-300">{`{user}`}</code>, <code className="bg-white/10 px-1 rounded text-gray-300">{`{server}`}</code>, <code className="bg-white/10 px-1 rounded text-gray-300">{`{memberCount}`}</code></p>
                        {config.plainEnabled && (
                            <div className="space-y-1 pt-1">
                                <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
                                    <FontAwesomeIcon icon={faHashtag} className="w-3 h-3 text-gray-400" />
                                    Plain Text Channel
                                </label>
                                <ChannelPicker
                                    guildId={guildId}
                                    value={config.plainChannelId || ""}
                                    onChange={(val: string | null) => setConfig({ ...config, plainChannelId: val || null })}
                                />
                                <p className="text-xs text-gray-500">Required — plain text only fires when this channel is set.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Embed Settings */}
                <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Embed Welcome</h3>
                        <label className="flex items-center cursor-pointer">
                            <span className="mr-3 text-sm font-medium text-gray-300">Enable Embeds</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={config.embedEnabled}
                                    onChange={(e) => setConfig({ ...config, embedEnabled: e.target.checked })}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${config.embedEnabled ? 'bg-[#8b5cf6]' : 'bg-gray-700'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.embedEnabled ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                        </label>
                    </div>

                    {config.embedEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-4 rounded-xl border border-white/[0.03]">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Embed Title</label>
                                <input
                                    type="text"
                                    value={config.embedTitle}
                                    onChange={(e) => setConfig({ ...config, embedTitle: e.target.value })}
                                    className="w-full bg-black/50 border border-white/[0.06] rounded-xl p-3 text-white focus:outline-none focus:border-[#8b5cf6]/50 transition-colors"
                                    placeholder="Welcome to {server}!"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Embed Color (Hex)</label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        value={config.embedColor}
                                        onChange={(e) => setConfig({ ...config, embedColor: e.target.value })}
                                        className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0"
                                    />
                                    <input
                                        type="text"
                                        value={config.embedColor}
                                        onChange={(e) => setConfig({ ...config, embedColor: e.target.value })}
                                        className="flex-1 bg-black/50 border border-white/[0.06] rounded-xl p-3 text-white focus:outline-none focus:border-[#8b5cf6]/50 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300">Embed Description</label>
                                <textarea
                                    value={config.embedDescription}
                                    onChange={(e) => setConfig({ ...config, embedDescription: e.target.value })}
                                    className="w-full h-32 bg-black/50 border border-white/[0.06] rounded-xl p-4 text-white focus:outline-none focus:border-[#8b5cf6]/50 transition-colors"
                                    placeholder="Welcome {user}! You are member #{memberCount}."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Embed Image URL</label>
                                <input
                                    type="text"
                                    value={config.embedImage || ""}
                                    onChange={(e) => setConfig({ ...config, embedImage: e.target.value || null })}
                                    className="w-full bg-black/50 border border-white/[0.06] rounded-xl p-3 text-white focus:outline-none focus:border-[#8b5cf6]/50 transition-colors"
                                    placeholder="https://example.com/image.png"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Embed Footer</label>
                                <input
                                    type="text"
                                    value={config.embedFooter}
                                    onChange={(e) => setConfig({ ...config, embedFooter: e.target.value })}
                                    className="w-full bg-black/50 border border-white/[0.06] rounded-xl p-3 text-white focus:outline-none focus:border-[#8b5cf6]/50 transition-colors"
                                    placeholder="Enjoy your stay!"
                                />
                            </div>
                            <div className="pt-2">
                                <label className="flex items-center cursor-pointer">
                                    <span className="mr-3 text-sm font-medium text-gray-300">Show User Avatar as Thumbnail</span>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={config.embedThumbnail}
                                            onChange={(e) => setConfig({ ...config, embedThumbnail: e.target.checked })}
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${config.embedThumbnail ? 'bg-[#8b5cf6]' : 'bg-gray-700'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.embedThumbnail ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                </label>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
                                    <FontAwesomeIcon icon={faHashtag} className="w-3 h-3 text-gray-400" />
                                    Embed Channel <span className="text-gray-500 font-normal">(optional override)</span>
                                </label>
                                <ChannelPicker
                                    guildId={guildId}
                                    value={config.embedChannelId || ""}
                                    onChange={(val: string | null) => setConfig({ ...config, embedChannelId: val || null })}
                                />
                                <p className="text-xs text-gray-500">Send the embed to a different channel than the main channel.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* DM Settings */}
                <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Direct Message (DM)</h3>
                        <label className="flex items-center cursor-pointer">
                            <span className="mr-3 text-sm font-medium text-gray-300">Send Welcome DM</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={config.dmEnabled}
                                    onChange={(e) => setConfig({ ...config, dmEnabled: e.target.checked })}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${config.dmEnabled ? 'bg-[#8b5cf6]' : 'bg-gray-700'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.dmEnabled ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                        </label>
                    </div>

                    {config.dmEnabled && (
                        <div className="space-y-2 bg-black/20 p-4 rounded-xl border border-white/[0.03]">
                            <label className="block text-sm font-medium text-gray-300">DM Message</label>
                            <textarea
                                value={config.dmMessage}
                                onChange={(e) => setConfig({ ...config, dmMessage: e.target.value })}
                                className="w-full h-24 bg-black/50 border border-white/[0.06] rounded-xl p-4 text-white focus:outline-none focus:border-[#8b5cf6]/50 transition-colors"
                                placeholder="Welcome to {server}! We are glad to have you here! 🎉"
                            />
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Logging info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
            >
                <FontAwesomeIcon icon={faCircleInfo} className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-200 mb-0.5">Member Join Event Logging</p>
                    <p className="text-xs text-blue-300/70">
                        Member join events (including suspicious account flags) are automatically dispatched through the central
                        Logging module. Configure the log channel under the <span className="font-semibold">Members</span> category there.
                    </p>
                </div>
                <Link
                    href={`/dashboard/${guildId}/modules/logging`}
                    className="shrink-0 flex items-center gap-1.5 text-xs text-blue-300 hover:text-blue-100 transition-colors font-medium whitespace-nowrap"
                >
                    Go to Logging
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-3 h-3" />
                </Link>
            </motion.div>

            <SaveBar
                isVisible={!!hasUnsavedChanges || saving}
                isSaving={saving}
                onSave={handleSave}
                onDiscard={handleDiscard}
                message="You have unsaved changes in Welcome"
            />
        </div>
    )
}
