"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faRightFromBracket,
    faSave,
    faArrowLeft,
    faSpinner,
    faCircleCheck
} from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"
import { ChannelPicker } from "@/components/dashboard/settings/channel-picker"
import isEqual from "lodash/isEqual"
import cloneDeep from "lodash/cloneDeep"

interface LeaveConfig {
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
    logEnabled: boolean
    logChannelId: string | null
    showJoinDate: boolean
    showAccountAge: boolean
    showRoles: boolean
}

export default function LeaveModulePage({
    params,
}: {
    params: Promise<{ guildId: string }>
}) {
    const { guildId } = React.use(params)
    const { data: session } = useSession()
    const [config, setConfig] = useState<LeaveConfig | null>(null)
    const [originalConfig, setOriginalConfig] = useState<LeaveConfig | null>(null)
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const hasUnsavedChanges = config && originalConfig && !isEqual(config, originalConfig)

    const { data: serverConfig, isLoading: configLoading } = useQuery({
        queryKey: ["leave", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/modules/leave`)
            if (!res.ok) throw new Error("Failed to fetch leave config")
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
            const res = await fetch(`/api/guilds/${guildId}/modules/leave`, {
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
            console.error("Failed to save leave config:", error)
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                            <FontAwesomeIcon icon={faRightFromBracket} className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Leave Module</h1>
                            <p className="text-gray-400 mt-1">
                                Say goodbye when members leave the server.
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
                            <label className="block text-sm font-medium text-gray-300">Leave Channel</label>
                            <ChannelPicker
                                guildId={guildId}
                                value={config.channelId || ""}
                                onChange={(val: string | null) => setConfig({ ...config, channelId: val || null })}
                            />
                            <p className="text-xs text-gray-500 mt-1">The main channel where goodbye messages are sent.</p>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="block text-sm font-medium text-gray-300">Plain Text Message</label>
                        <textarea
                            value={config.message}
                            onChange={(e) => setConfig({ ...config, message: e.target.value })}
                            className="w-full h-32 bg-black/50 border border-white/[0.06] rounded-xl p-4 text-white focus:outline-none focus:border-[#8b5cf6]/50 transition-colors"
                            placeholder="{username} has left {server}. We now have {memberCount} members."
                        />
                        <p className="text-xs text-gray-500 mt-1">Variables: <code className="bg-white/10 px-1 rounded text-gray-300">{`{username}`}</code>, <code className="bg-white/10 px-1 rounded text-gray-300">{`{server}`}</code>, <code className="bg-white/10 px-1 rounded text-gray-300">{`{memberCount}`}</code></p>
                    </div>
                </div>

                {/* Embed Settings */}
                <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Embed Leave</h3>
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
                                    placeholder="Member Left"
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
                                    placeholder="{username} has left the server.\n\nMember Count: {memberCount}"
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
                                    placeholder="Goodbye!"
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
                        </div>
                    )}
                </div>

                {/* Additional Settings */}
                <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Logging & Stats</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4 bg-black/20 p-4 rounded-xl border border-white/[0.03]">
                        <label className="flex items-center cursor-pointer">
                            <span className="mr-3 text-sm font-medium text-gray-300">Enable Leave Logging</span>
                            <div className="relative ml-auto">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={config.logEnabled}
                                    onChange={(e) => setConfig({ ...config, logEnabled: e.target.checked })}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${config.logEnabled ? 'bg-[#8b5cf6]' : 'bg-gray-700'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.logEnabled ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                        </label>

                        {config.logEnabled && (
                            <div className="space-y-2 mt-2">
                                <label className="block text-sm font-medium text-gray-300">Logging Channel</label>
                                <ChannelPicker
                                    guildId={guildId}
                                    value={config.logChannelId || ""}
                                    onChange={(val: string | null) => setConfig({ ...config, logChannelId: val || null })}
                                />
                            </div>
                        )}

                        <hr className="border-white/[0.06] my-2" />

                        <label className="flex items-center cursor-pointer">
                            <span className="mr-3 text-sm font-medium text-gray-300">Show Roles</span>
                            <div className="relative ml-auto">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={config.showRoles}
                                    onChange={(e) => setConfig({ ...config, showRoles: e.target.checked })}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${config.showRoles ? 'bg-[#8b5cf6]' : 'bg-gray-700'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.showRoles ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                        </label>

                        <label className="flex items-center cursor-pointer">
                            <span className="mr-3 text-sm font-medium text-gray-300">Show Join Date</span>
                            <div className="relative ml-auto">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={config.showJoinDate}
                                    onChange={(e) => setConfig({ ...config, showJoinDate: e.target.checked })}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${config.showJoinDate ? 'bg-[#8b5cf6]' : 'bg-gray-700'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.showJoinDate ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                        </label>

                        <label className="flex items-center cursor-pointer">
                            <span className="mr-3 text-sm font-medium text-gray-300">Show Account Age</span>
                            <div className="relative ml-auto">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={config.showAccountAge}
                                    onChange={(e) => setConfig({ ...config, showAccountAge: e.target.checked })}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${config.showAccountAge ? 'bg-[#8b5cf6]' : 'bg-gray-700'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.showAccountAge ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                        </label>
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
                                ⚠️ <span>You have unsaved changes in Leave</span>
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
