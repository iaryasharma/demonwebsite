"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faShieldHalved,
    faSave,
    faArrowLeft,
    faSpinner,
    faCircleCheck,
    faImage,
    faPalette,
    faFont,
    faLink,
    faMessage,
    faLock,
    faClock,
    faCalendarDays,
    faWrench,
    faHashtag
} from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"
import { ChannelPicker } from "@/components/dashboard/settings/channel-picker"
import isEqual from "lodash/isEqual"
import cloneDeep from "lodash/cloneDeep"

interface VerificationConfig {
    enabled: boolean
    channelId: string | null
    roleId: string | null
    unverifiedRoleId: string | null
    messageId: string | null
    embedTitle: string
    embedDescription: string
    embedColor: string
    buttonLabel: string
    verifiedMessage: string
    kickUnverified: boolean
    kickTimeout: number
    type: 'button' | 'code' | 'captcha'
    minAccountAge: number
    logChannelId: string | null
}

interface Role {
    id: string
    name: string
    color: number
    position: number
}

// ── Helpers ─────────────────────────────────────────────
const TIMEOUT_OPTIONS = [
    { label: "5 Minutes", value: 300 },
    { label: "10 Minutes", value: 600 },
    { label: "15 Minutes", value: 900 },
    { label: "30 Minutes", value: 1800 },
    { label: "1 Hour", value: 3600 },
    { label: "12 Hours", value: 43200 },
    { label: "1 Day", value: 86400 },
    { label: "3 Days", value: 259200 },
    { label: "7 Days", value: 604800 },
]

export default function VerificationPage({
    params,
}: {
    params: Promise<{ guildId: string }>
}) {
    const { guildId } = React.use(params)
    const { data: session } = useSession()

    const [config, setConfig] = useState<VerificationConfig | null>(null)
    const [originalConfig, setOriginalConfig] = useState<VerificationConfig | null>(null)
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const hasUnsavedChanges = config && originalConfig && !isEqual(config, originalConfig)

    const { data: serverConfig, isLoading: configLoading } = useQuery({
        queryKey: ["verification", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/modules/verification`)
            if (!res.ok) throw new Error("Failed to fetch verification config")
            return res.json()
        },
        enabled: !!guildId,
    })

    const { data: roles = [], isLoading: rolesLoading } = useQuery<Role[]>({
        queryKey: ["roles", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/roles`)
            if (!res.ok) throw new Error("Failed to fetch roles")
            return res.json()
        },
        enabled: !!guildId,
        staleTime: 3 * 60 * 1000, // 3 minutes
    })

    // Sync remote cache into local draft state precisely once per load
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
            const res = await fetch(`/api/guilds/${guildId}/modules/verification`, {
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
            console.error("Failed to save verification config:", error)
        } finally {
            setSaving(false)
        }
    }

    if (configLoading || rolesLoading || !config) {
        return (
            <div className="flex items-center justify-center py-20">
                <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#8b5cf6] animate-spin" />
            </div>
        )
    }

    // Filter out @everyone role
    const assignableRoles = roles.filter(r => r.id !== guildId).sort((a, b) => b.position - a.position)

    const getTypeDescription = () => {
        switch (config.type) {
            case 'code': return "Members will receive a random code in a private message and must type it correctly."
            case 'captcha': return "A CAPTCHA image will be shown publicly. Members click verify and type it back."
            case 'button':
            default: return "Members simply click a 'Verify' button to gain instant access."
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
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
                            <FontAwesomeIcon icon={faShieldHalved} className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Verification System</h1>
                            <p className="text-gray-400 mt-1">
                                Require members to verify to access your server channels.
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
                            {config.enabled ? "System Enabled" : "System Disabled"}
                        </div>
                    </label>
                </div>
            </motion.div>

            {/* Core Verification Setup */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl border border-white/[0.06] p-6 space-y-8"
            >
                <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
                    <FontAwesomeIcon icon={faWrench} className="text-[#8b5cf6] w-5 h-5" />
                    <h2 className="text-xl font-bold text-white">Core Setup</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Verification Method */}
                    <div className="space-y-3 md:col-span-2 bg-black/20 p-4 rounded-xl border border-white/[0.03]">
                        <h3 className="font-semibold text-white">Verification Method</h3>
                        <p className="text-sm text-gray-400">{getTypeDescription()}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {['button', 'code', 'captcha'].map((type) => (
                                <label key={type} className={`cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-all ${config.type === type ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-white' : 'bg-black/30 border-white/[0.06] text-gray-400 hover:border-white/20'}`}>
                                    <input
                                        type="radio"
                                        className="sr-only"
                                        checked={config.type === type}
                                        onChange={() => setConfig({ ...config, type: type as any })}
                                    />
                                    <span className="capitalize font-medium">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium text-white mb-1">Verification Channel</label>
                        <p className="text-xs text-gray-400 mb-2">The public channel where the verification embed is posted.</p>
                        <ChannelPicker
                            guildId={guildId}
                            value={config.channelId || ""}
                            onChange={(val) => setConfig({ ...config, channelId: val || null })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium text-white mb-1">Verified Role</label>
                        <p className="text-xs text-gray-400 mb-2">Role given upon successful verification.</p>
                        <select
                            value={config.roleId || ""}
                            onChange={(e) => setConfig({ ...config, roleId: e.target.value || null })}
                            className="w-full bg-black/40 border border-white/[0.06] text-white text-sm rounded-lg focus:ring-[#8b5cf6] focus:border-[#8b5cf6] block p-2.5"
                        >
                            <option value="">Select a role...</option>
                            {assignableRoles.map((role) => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium text-white mb-1">Unverified Role (Optional)</label>
                        <p className="text-xs text-gray-400 mb-2">Role assigned BEFORE verifying (like a quarantine role).</p>
                        <select
                            value={config.unverifiedRoleId || ""}
                            onChange={(e) => setConfig({ ...config, unverifiedRoleId: e.target.value || null })}
                            className="w-full bg-black/40 border border-white/[0.06] text-white text-sm rounded-lg focus:ring-[#8b5cf6] focus:border-[#8b5cf6] block p-2.5"
                        >
                            <option value="">None (Don't use unverified role)</option>
                            {assignableRoles.map((role) => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium text-white mb-1">Log Channel (Optional)</label>
                        <p className="text-xs text-gray-400 mb-2">Track verification successes and failures.</p>
                        <ChannelPicker
                            guildId={guildId}
                            value={config.logChannelId || ""}
                            onChange={(val) => setConfig({ ...config, logChannelId: val || null })}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Embed & Message Customization */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl border border-white/[0.06] p-6 space-y-6"
            >
                <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
                    <FontAwesomeIcon icon={faImage} className="text-[#8b5cf6] w-5 h-5" />
                    <h2 className="text-xl font-bold text-white">Embed Presentation</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                <FontAwesomeIcon icon={faFont} /> Embed Title
                            </label>
                            <input
                                type="text"
                                value={config.embedTitle}
                                onChange={(e) => setConfig({ ...config, embedTitle: e.target.value })}
                                className="w-full bg-black/40 border border-white/[0.06] text-white text-sm rounded-lg focus:ring-[#8b5cf6] focus:border-[#8b5cf6] block p-2.5"
                                placeholder="e.g. Server Verification"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                <FontAwesomeIcon icon={faPalette} /> Embed Color (Hex Location)
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={config.embedColor}
                                    onChange={(e) => setConfig({ ...config, embedColor: e.target.value })}
                                    className="h-10 w-12 rounded bg-transparent border-0 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={config.embedColor}
                                    onChange={(e) => setConfig({ ...config, embedColor: e.target.value })}
                                    className="flex-1 bg-black/40 border border-white/[0.06] text-white text-sm rounded-lg focus:ring-[#8b5cf6] focus:border-[#8b5cf6] block p-2.5 uppercase font-mono"
                                    pattern="^#[0-9a-fA-F]{6}$"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                <FontAwesomeIcon icon={faLink} /> Action Button Label
                            </label>
                            <input
                                type="text"
                                value={config.buttonLabel}
                                onChange={(e) => setConfig({ ...config, buttonLabel: e.target.value })}
                                className="w-full bg-black/40 border border-white/[0.06] text-white text-sm rounded-lg focus:ring-[#8b5cf6] focus:border-[#8b5cf6] block p-2.5"
                                placeholder="e.g. Verify Here"
                                maxLength={80}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2 h-full">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                <FontAwesomeIcon icon={faMessage} /> Embed Description
                            </label>
                            <textarea
                                value={config.embedDescription}
                                onChange={(e) => setConfig({ ...config, embedDescription: e.target.value })}
                                rows={6}
                                className="w-full h-[calc(100%-28px)] bg-black/40 border border-white/[0.06] text-white text-sm rounded-lg focus:ring-[#8b5cf6] focus:border-[#8b5cf6] block p-2.5 resize-none"
                                placeholder="Instructions for users..."
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06]">
                    <div className="space-y-2">
                        <label className="block font-medium text-white mb-1">Success Follow-up Message</label>
                        <p className="text-xs text-gray-400 mb-2">Sent directly measuring to user when verified. Use {"{server}"} variable.</p>
                        <input
                            type="text"
                            value={config.verifiedMessage}
                            onChange={(e) => setConfig({ ...config, verifiedMessage: e.target.value })}
                            className="w-full bg-black/40 border border-white/[0.06] text-white text-sm rounded-lg focus:ring-[#8b5cf6] focus:border-[#8b5cf6] block p-2.5"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Anti-Raid Protections */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl border border-white/[0.06] p-6 space-y-6"
            >
                <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
                    <FontAwesomeIcon icon={faLock} className="text-red-400 w-5 h-5" />
                    <h2 className="text-xl font-bold text-white">Security & Anti-Raid Limits</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Unverified Kick Timeout */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white">
                                <FontAwesomeIcon icon={faClock} className="text-yellow-400" />
                                <span className="font-semibold">Auto-Kick Timeout</span>
                            </div>
                            <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={config.kickUnverified}
                                        onChange={(e) => setConfig({ ...config, kickUnverified: e.target.checked })}
                                    />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${config.kickUnverified ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.kickUnverified ? 'transform translate-x-4' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                        <p className="text-sm text-gray-400 min-h-[40px]">Automatically kick members if they fail to verify within a specific time window.</p>

                        <AnimatePresence>
                            {config.kickUnverified && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <select
                                        value={config.kickTimeout}
                                        onChange={(e) => setConfig({ ...config, kickTimeout: parseInt(e.target.value) })}
                                        className="w-full bg-black/40 border border-white/[0.06] text-white text-sm rounded-xl focus:ring-[#8b5cf6] focus:border-[#8b5cf6] block p-3"
                                    >
                                        {TIMEOUT_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Minimum Account Age Limit */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white">
                                <FontAwesomeIcon icon={faCalendarDays} className="text-emerald-400" />
                                <span className="font-semibold">Reject Young Accounts</span>
                            </div>
                            <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={config.minAccountAge > 0}
                                        onChange={(e) => setConfig({ ...config, minAccountAge: e.target.checked ? 7 : 0 })}
                                    />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${config.minAccountAge > 0 ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.minAccountAge > 0 ? 'transform translate-x-4' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                        <p className="text-sm text-gray-400 min-h-[40px]">Block verification attempts from discord accounts created very recently.</p>

                        <AnimatePresence>
                            {config.minAccountAge > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={config.minAccountAge}
                                            onChange={(e) => setConfig({ ...config, minAccountAge: parseInt(e.target.value) || 1 })}
                                            className="w-24 bg-black/40 border border-white/[0.06] text-white text-sm rounded-lg focus:ring-[#8b5cf6] focus:border-[#8b5cf6] block p-2.5"
                                        />
                                        <span className="text-sm text-gray-300">Days old minimum</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                                ⚠️ <span>You have unsaved changes in Verification</span>
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
                                    Save Verification System
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
