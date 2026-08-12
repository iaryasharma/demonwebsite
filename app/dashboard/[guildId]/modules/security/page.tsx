"use client"

import React, { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faShieldHalved,
    faArrowLeft,
    faSpinner,
    faUserShield,
    faHistory,
    faUserCheck,
    faBan,
    faGear,
    faUserPlus,
    faTrash,
    faPlus,
    faTriangleExclamation,
    faBullhorn,
    faXmark,
    faCheck,
    faFilter,
    faUser
} from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"
import { ChannelPicker } from "@/components/dashboard/settings/channel-picker"
import { RolePicker } from "@/components/dashboard/settings/role-picker"
import { toast } from "sonner"
import { SaveBar } from "@/components/dashboard/save-bar"
import { MultiRolePicker } from "@/components/dashboard/settings/multi-role-picker"
import { UserPill } from "@/components/dashboard/settings/user-pill"
import isEqual from "lodash/isEqual"
import cloneDeep from "lodash/cloneDeep"
import {
    EVENT_PUNISHMENT_KEYS,
    EVENT_PUNISHMENT_LABELS,
    PUNISHMENT_OPTIONS,
    PROTECTION_LABELS,
    emptyEventPunishments,
    normalizePunishmentType,
    type EventPunishmentKey,
    type PunishmentType,
} from "@/lib/security-constants"

interface SecurityConfig {
    enabled: boolean
    captchaRequired: boolean
    protections: {
        antiChannelCreate: boolean
        antiChannelDelete: boolean
        antiRoleCreate: boolean
        antiRoleDelete: boolean
        antiMemberKick: boolean
        antiMemberBan: boolean
        antiPrune: boolean
        antiBotAdd: boolean
        antiDangerousRoleGrant: boolean
    }
    limits: {
        channelCreateLimit: number
        channelDeleteLimit: number
        roleCreateLimit: number
        roleDeleteLimit: number
        memberKickLimit: number
        memberBanLimit: number
        botAddLimit: number
        timeframe: number
    }
    punishment: {
        type: PunishmentType
        rolesToRemove: string[]
    }
    eventPunishments: Record<EventPunishmentKey, PunishmentType | null>
    quarantineRoleId: string | null
    dryRun: boolean
    securityLogChannelId: string | null
}

function normalizeConfig(raw: Partial<SecurityConfig> & Record<string, unknown>): SecurityConfig {
    const punishment = (raw.punishment && typeof raw.punishment === "object"
        ? raw.punishment
        : {}) as { type?: unknown; rolesToRemove?: string[] }
    const eventSrc = (raw.eventPunishments && typeof raw.eventPunishments === "object"
        ? raw.eventPunishments
        : {}) as Record<string, unknown>
    const eventPunishments = emptyEventPunishments()
    for (const key of EVENT_PUNISHMENT_KEYS) {
        const v = eventSrc[key]
        eventPunishments[key] = v == null || v === "" ? null : normalizePunishmentType(v)
    }

    return {
        enabled: Boolean(raw.enabled),
        captchaRequired: raw.captchaRequired !== false,
        protections: {
            antiChannelCreate: Boolean(raw.protections?.antiChannelCreate),
            antiChannelDelete: Boolean(raw.protections?.antiChannelDelete),
            antiRoleCreate: Boolean(raw.protections?.antiRoleCreate),
            antiRoleDelete: Boolean(raw.protections?.antiRoleDelete),
            antiMemberKick: Boolean(raw.protections?.antiMemberKick),
            antiMemberBan: Boolean(raw.protections?.antiMemberBan),
            antiPrune: Boolean(raw.protections?.antiPrune),
            antiBotAdd: Boolean(raw.protections?.antiBotAdd),
            antiDangerousRoleGrant: Boolean(raw.protections?.antiDangerousRoleGrant),
        },
        limits: {
            channelCreateLimit: Number(raw.limits?.channelCreateLimit ?? 5),
            channelDeleteLimit: Number(raw.limits?.channelDeleteLimit ?? 5),
            roleCreateLimit: Number(raw.limits?.roleCreateLimit ?? 5),
            roleDeleteLimit: Number(raw.limits?.roleDeleteLimit ?? 5),
            memberKickLimit: Number(raw.limits?.memberKickLimit ?? 3),
            memberBanLimit: Number(raw.limits?.memberBanLimit ?? 3),
            botAddLimit: Number(raw.limits?.botAddLimit ?? 1),
            timeframe: Number(raw.limits?.timeframe ?? 300),
        },
        punishment: {
            type: normalizePunishmentType(punishment.type),
            rolesToRemove: Array.isArray(punishment.rolesToRemove) ? punishment.rolesToRemove : [],
        },
        eventPunishments,
        quarantineRoleId: (raw.quarantineRoleId as string | null) ?? null,
        dryRun: Boolean(raw.dryRun),
        securityLogChannelId: (raw.securityLogChannelId as string | null) ?? null,
    }
}

interface WhitelistEntry {
    _id: string
    userId: string | null
    roleId: string | null
    entryType: 'user' | 'role'
    categories: string[]
    reason: string | null
    isProtected: boolean
}

interface Violation {
    _id: string
    userId: string
    actionType: string
    attemptCount: number
    limitSet: number
    punishment: {
        type: string
        applied: boolean
        appliedAt: string
    }
    context: {
        actionDetails: string | null
        targetId: string | null
    }
    createdAt: string
}

export default function SecurityModulePage({
    params,
}: {
    params: Promise<{ guildId: string }>
}) {
    const { guildId } = React.use(params)
    const queryClient = useQueryClient()
    const [config, setConfig] = useState<SecurityConfig | null>(null)
    const [originalConfig, setOriginalConfig] = useState<SecurityConfig | null>(null)
    const [activeTab, setActiveTab] = useState<'settings' | 'whitelist' | 'violations'>('settings')
    const [saving, setSaving] = useState(false)

    // Advanced Whitelist Form State
    const [userInputs, setUserInputs] = useState<Record<string, string>>({})
    const [roleInputs, setRoleInputs] = useState<Record<string, string[]>>({})
    const [wlReason, setWlReason] = useState("")

    const WHITELIST_CATEGORIES = [
        { id: 'all', name: 'Global (All Modules)' },
        { id: 'role', name: 'Role Management' },
        { id: 'channel', name: 'Channel Management' },
        { id: 'kick', name: 'Kick Members' },
        { id: 'ban', name: 'Ban Members' },
        { id: 'prune', name: 'Prune Members' },
        { id: 'adminActions', name: 'Admin Actions' },
        { id: 'addBots', name: 'Add Bots' },
    ]

    // Queries
    const { data: serverConfig, isLoading: configLoading } = useQuery({
        queryKey: ["security-config", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/modules/security/config`)
            if (!res.ok) throw new Error("Failed to fetch security config")
            return res.json()
        }
    })

    const { data: whitelist, isLoading: whitelistLoading } = useQuery<WhitelistEntry[]>({
        queryKey: ["security-whitelist", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/modules/security/whitelist`)
            if (!res.ok) throw new Error("Failed to fetch whitelist")
            return res.json()
        }
    })

    const { data: violations, isLoading: violationsLoading } = useQuery<Violation[]>({
        queryKey: ["security-violations", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/modules/security/violations`)
            if (!res.ok) throw new Error("Failed to fetch violations")
            return res.json()
        }
    })

    useEffect(() => {
        if (serverConfig && !originalConfig) {
            const normalized = normalizeConfig(serverConfig)
            setConfig(cloneDeep(normalized))
            setOriginalConfig(cloneDeep(normalized))
        }
    }, [serverConfig, originalConfig])

    const hasUnsavedChanges = config && originalConfig && !isEqual(config, originalConfig)

    const handleSave = async () => {
        if (!config) return
        setSaving(true)
        try {
            const res = await fetch(`/api/guilds/${guildId}/modules/security/config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            })
            if (res.ok) {
                setOriginalConfig(cloneDeep(config))
                toast.success("Security configuration saved!")
                queryClient.invalidateQueries({ queryKey: ["security-config", guildId] })
            } else {
                toast.error("Failed to save security configuration")
            }
        } catch (error) {
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

    const deleteWhitelist = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/guilds/${guildId}/modules/security/whitelist`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            })
            if (!res.ok) throw new Error("Failed to delete entry")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["security-whitelist", guildId] })
            toast.success("Whitelist entry removed")
        }
    })

    const addBulkWhitelist = useMutation({
        mutationFn: async (entries: Partial<WhitelistEntry>[]) => {
            const res = await fetch(`/api/guilds/${guildId}/modules/security/whitelist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entries),
            })
            if (!res.ok) throw new Error("Failed to add entries")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["security-whitelist", guildId] })
            toast.success("Whitelist entries added!")
            setUserInputs({})
            setRoleInputs({})
            setWlReason("")
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to add whitelist entries")
        }
    })

    const handleAddWhitelist = () => {
        const entries: any[] = []
        
        // Process User Inputs per Category
        Object.entries(userInputs).forEach(([catId, value]) => {
            if (!value) return
            const ids = (value as string).split(',').map(id => id.trim()).filter(id => id.length > 0)
            ids.forEach(id => {
                entries.push({
                    userId: id,
                    entryType: 'user',
                    categories: [catId],
                    reason: wlReason
                })
            })
        })

        // Process Role Inputs per Category
        Object.entries(roleInputs).forEach(([catId, ids]) => {
            if (!ids || ids.length === 0) return
            (ids as string[]).forEach(id => {
                entries.push({
                    roleId: id,
                    entryType: 'role',
                    categories: [catId],
                    reason: wlReason
                })
            })
        })

        if (entries.length === 0) {
            return toast.error("Please fill in at least one module's whitelist")
        }
        
        addBulkWhitelist.mutate(entries)
    }

    const updateUserInput = (catId: string, value: string) => {
        setUserInputs(prev => ({ ...prev, [catId]: value }))
    }

    const updateRoleInput = (catId: string, value: string[]) => {
        setRoleInputs(prev => ({ ...prev, [catId]: value }))
    }

    if (configLoading || !config) {
        return (
            <div className="flex items-center justify-center py-20">
                <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#8b5cf6] animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-orange-700 flex items-center justify-center shadow-lg">
                            <FontAwesomeIcon icon={faShieldHalved} className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Security Module</h1>
                            <p className="text-gray-400 mt-1">
                                Advanced protection against raiding and malicious behavior.
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
                            {config.enabled ? "Security Active" : "Security Paused"}
                        </div>
                    </label>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-black/20 rounded-xl border border-white/[0.06] w-fit">
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-[#8b5cf6] text-white' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'}`}
                >
                    <FontAwesomeIcon icon={faGear} className="w-3.5 h-3.5" />
                    Settings & Limits
                </button>
                <button
                    onClick={() => setActiveTab('whitelist')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'whitelist' ? 'bg-[#8b5cf6] text-white' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'}`}
                >
                    <FontAwesomeIcon icon={faUserCheck} className="w-3.5 h-3.5" />
                    Whitelist
                </button>
                <button
                    onClick={() => setActiveTab('violations')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'violations' ? 'bg-[#ff4e4e] text-white' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'}`}
                >
                    <FontAwesomeIcon icon={faHistory} className="w-3.5 h-3.5" />
                    Violation History
                    {violations && violations.length > 0 && (
                        <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
                    )}
                </button>
            </div>

            {/* Content Container */}
            <AnimatePresence mode="wait">
                {activeTab === 'settings' && (
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-8"
                    >
                        {/* Channel Selection */}
                        <div className="glass rounded-2xl border border-white/[0.06] p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <FontAwesomeIcon icon={faBullhorn} className="text-[#8b5cf6]" />
                                <h2 className="text-xl font-bold text-white">Security Logging</h2>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">Choose where security alerts and nuke attempts will be logged.</p>
                            <div className="max-w-md">
                                <ChannelPicker
                                    guildId={guildId}
                                    value={config.securityLogChannelId || ""}
                                    onChange={(val: string | null) => setConfig({ ...config, securityLogChannelId: val || null })}
                                />
                            </div>
                        </div>

                        {/* Dry run + quarantine role */}
                        <div className="glass rounded-2xl border border-white/[0.06] p-6 space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
                                <FontAwesomeIcon icon={faUserShield} className="text-[#8b5cf6]" />
                                <h2 className="text-xl font-bold text-white">Enforcement Mode</h2>
                            </div>

                            <label className="flex items-center justify-between cursor-pointer group bg-black/20 p-4 rounded-xl border border-white/[0.03] hover:bg-black/30 transition-all">
                                <div>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Dry run</span>
                                    <p className="text-xs text-gray-500 mt-1">Log and count only — no undo or punishment applied.</p>
                                </div>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={config.dryRun}
                                        onChange={(e) => setConfig({ ...config, dryRun: e.target.checked })}
                                    />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${config.dryRun ? 'bg-amber-500' : 'bg-gray-700'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.dryRun ? 'transform translate-x-4' : ''}`}></div>
                                </div>
                            </label>

                            <div className="max-w-md space-y-2">
                                <label className="text-sm font-medium text-gray-300">Quarantine role (optional)</label>
                                <p className="text-xs text-gray-500">Granted after stripping roles when punishment is Quarantine.</p>
                                <RolePicker
                                    guildId={guildId}
                                    value={config.quarantineRoleId || ""}
                                    onChange={(val: string | null) => setConfig({ ...config, quarantineRoleId: val || null })}
                                    placeholder="None — strip roles + timeout only"
                                />
                            </div>
                        </div>

                        {/* Protections Section */}
                        <div className="glass rounded-2xl border border-white/[0.06] p-6">
                            <div className="flex items-center gap-3 mb-6 border-b border-white/[0.06] pb-4">
                                <FontAwesomeIcon icon={faUserShield} className="text-[#8b5cf6]" />
                                <h2 className="text-xl font-bold text-white">Anti-Audit Log Protections</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.keys(config.protections).map((key) => {
                                    const protectionKey = key as keyof SecurityConfig['protections'];
                                    const label = PROTECTION_LABELS[key] || key
                                    
                                    return (
                                        <label key={key} className="flex items-center justify-between cursor-pointer group bg-black/20 p-4 rounded-xl border border-white/[0.03] hover:bg-black/30 transition-all">
                                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{label}</span>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={config.protections[protectionKey]}
                                                    onChange={(e) => setConfig({
                                                        ...config,
                                                        protections: { ...config.protections, [protectionKey]: e.target.checked }
                                                    })}
                                                />
                                                <div className={`block w-10 h-6 rounded-full transition-colors ${config.protections[protectionKey] ? 'bg-[#8b5cf6]' : 'bg-gray-700'}`}></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.protections[protectionKey] ? 'transform translate-x-4' : ''}`}></div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Limits Section */}
                        <div className="glass rounded-2xl border border-white/[0.06] p-6">
                            <div className="flex items-center gap-3 mb-6 border-b border-white/[0.06] pb-4">
                                <FontAwesomeIcon icon={faBan} className="text-orange-500" />
                                <h2 className="text-xl font-bold text-white">Action Limits</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-sm font-medium text-gray-300">Timeframe Window (Seconds)</label>
                                            <span className="text-[#8b5cf6] font-bold">{config.limits.timeframe}s</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="60"
                                            max="3600"
                                            step="60"
                                            value={config.limits.timeframe}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                limits: { ...config.limits, timeframe: parseInt(e.target.value) }
                                            })}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#8b5cf6]"
                                        />
                                        <p className="text-xs text-gray-500 italic">Actions per user within this window before punishment.</p>
                                    </div>

                                    {Object.keys(config.limits).filter(k => k !== 'timeframe').map((key) => {
                                        const limitKey = key as keyof SecurityConfig['limits'];
                                        const label = key
                                            .replace(/Limit$/i, '')
                                            .replace(/([A-Z])/g, ' $1')
                                            .trim();
                                        
                                        return (
                                            <div key={key} className="space-y-2">
                                                <div className="flex justify-between">
                                                    <label className="text-sm font-medium text-gray-300">{label} Limit</label>
                                                    <span className="text-orange-500 font-bold">{config.limits[limitKey]}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="50"
                                                    value={config.limits[limitKey]}
                                                    onChange={(e) => setConfig({
                                                        ...config,
                                                        limits: { ...config.limits, [limitKey]: parseInt(e.target.value) }
                                                    })}
                                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="bg-[#8b5cf6]/5 rounded-2xl p-6 border border-[#8b5cf6]/10 flex flex-col justify-center">
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
                                            <FontAwesomeIcon icon={faTriangleExclamation} className="w-8 h-8 text-red-500 font-bold" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Default Punishment</h3>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Quarantine strips removable roles and applies a 28-day timeout.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-3">
                                            {PUNISHMENT_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setConfig({
                                                        ...config,
                                                        punishment: { ...config.punishment, type: opt.id }
                                                    })}
                                                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all border ${config.punishment.type === opt.id ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20' : 'bg-white/[0.03] border-white/[0.05] text-gray-400 hover:text-white'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Per-event punishment overrides */}
                        <div className="glass rounded-2xl border border-white/[0.06] p-6">
                            <div className="flex items-center gap-3 mb-2 border-b border-white/[0.06] pb-4">
                                <FontAwesomeIcon icon={faGear} className="text-[#8b5cf6]" />
                                <h2 className="text-xl font-bold text-white">Per-Event Punishments</h2>
                            </div>
                            <p className="text-sm text-gray-400 mb-6">
                                Override the default punishment for specific events. Leave as Inherit to use the default above.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {EVENT_PUNISHMENT_KEYS.map((key) => (
                                    <div
                                        key={key}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/20 p-4 rounded-xl border border-white/[0.03]"
                                    >
                                        <span className="text-sm font-medium text-gray-300">{EVENT_PUNISHMENT_LABELS[key]}</span>
                                        <select
                                            value={config.eventPunishments[key] ?? ""}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                setConfig({
                                                    ...config,
                                                    eventPunishments: {
                                                        ...config.eventPunishments,
                                                        [key]: val === "" ? null : (val as PunishmentType),
                                                    },
                                                })
                                            }}
                                            className="bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8b5cf6]/50"
                                        >
                                            <option value="">Inherit default</option>
                                            {PUNISHMENT_OPTIONS.map((opt) => (
                                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'whitelist' && (
                    <motion.div
                        key="whitelist"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Whitelisting Management</h2>
                        </div>

                        <div className="glass p-8 rounded-2xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/5 space-y-10">
                            {/* USER WHITELIST SECTION */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                        <FontAwesomeIcon icon={faUser} className="text-blue-400 w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black uppercase tracking-tighter text-lg">User Whitelisting</h3>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Manage whitelisted members per module</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {WHITELIST_CATEGORIES.map(cat => {
                                        const entries = whitelist?.filter(e => e.entryType === 'user' && e.categories.includes(cat.id)) || [];
                                        return (
                                            <div key={cat.id} className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-[#8b5cf6]/30 transition-colors group">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-[#8b5cf6] transition-colors">{cat.name}</label>
                                                    {entries.length > 0 && (
                                                        <span className="text-[10px] text-[#8b5cf6] font-bold">{entries.length} Active</span>
                                                    )}
                                                </div>
                                                
                                                {/* Pills display */}
                                                {entries.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 pb-2">
                                                        {entries.map(entry => (
                                                            <UserPill
                                                                key={entry._id}
                                                                guildId={guildId}
                                                                userId={entry.userId!}
                                                                categories={[]} // Hide category tags inside the card
                                                                entryId={entry._id}
                                                                isProtected={entry.isProtected}
                                                                reason={entry.reason}
                                                                onRemove={(id) => deleteWhitelist.mutate(id)}
                                                                isRemoving={deleteWhitelist.isPending}
                                                            />
                                                        ))}
                                                    </div>
                                                )}

                                                <textarea 
                                                    placeholder="Add more User IDs (comma separated)..."
                                                    value={userInputs[cat.id] || ""}
                                                    onChange={(e) => updateUserInput(cat.id, e.target.value)}
                                                    className="w-full h-16 bg-[#0a0a0a] border border-white/[0.06] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#8b5cf6]/50 transition-colors custom-scrollbar"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ROLE WHITELIST SECTION */}
                            <div className="space-y-6 pt-10 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                        <FontAwesomeIcon icon={faShieldHalved} className="text-purple-400 w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black uppercase tracking-tighter text-lg">Role Whitelisting</h3>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Manage whitelisted roles per module</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {WHITELIST_CATEGORIES.map(cat => {
                                        const entries = whitelist?.filter(e => e.entryType === 'role' && e.categories.includes(cat.id)) || [];
                                        return (
                                            <div key={cat.id} className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-[#8b5cf6]/30 transition-colors group">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-[#8b5cf6] transition-colors">{cat.name}</label>
                                                    {entries.length > 0 && (
                                                        <span className="text-[10px] text-[#8b5cf6] font-bold">{entries.length} Active</span>
                                                    )}
                                                </div>

                                                {/* Role badges display */}
                                                {entries.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 pb-2">
                                                        {entries.map(entry => (
                                                            <div key={entry._id} className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-[#8b5cf6]/20 bg-[#8b5cf6]/5 group/pill">
                                                                <div className="w-4 h-4 rounded-full bg-[#8b5cf6]/30 flex items-center justify-center">
                                                                    <FontAwesomeIcon icon={faShieldHalved} className="w-2 h-2 text-[#8b5cf6]" />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-white max-w-[80px] truncate">{entry.roleId}</span>
                                                                {!entry.isProtected && (
                                                                    <button
                                                                        onClick={() => deleteWhitelist.mutate(entry._id)}
                                                                        disabled={deleteWhitelist.isPending}
                                                                        className="w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover/pill:opacity-100 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all disabled:opacity-50"
                                                                    >
                                                                        {deleteWhitelist.isPending ? (
                                                                            <FontAwesomeIcon icon={faSpinner} className="w-2 h-2 animate-spin" />
                                                                        ) : (
                                                                            <FontAwesomeIcon icon={faXmark} className="w-2 h-2" />
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <MultiRolePicker 
                                                    guildId={guildId}
                                                    value={roleInputs[cat.id] || []}
                                                    onChange={(val) => updateRoleInput(cat.id, val)}
                                                    placeholder="Manage roles..."
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5">
                                <div className="w-full md:max-w-md">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">General Reason (Optional)</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Trustworthy admin team"
                                        value={wlReason}
                                        onChange={(e) => setWlReason(e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#8b5cf6]/50 transition-colors"
                                    />
                                </div>
                                <button 
                                    onClick={handleAddWhitelist}
                                    disabled={addBulkWhitelist.isPending}
                                    className="w-full md:w-auto bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-50 text-white px-12 py-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#8b5cf6]/20"
                                >
                                    {addBulkWhitelist.isPending ? (
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                    ) : (
                                        <FontAwesomeIcon icon={faUserPlus} />
                                    )}
                                    SAVE WHITELIST BATCH
                                </button>
                            </div>
                        </div>

                        {whitelistLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#8b5cf6] animate-spin" />
                            </div>
                        ) : !whitelist || whitelist.length === 0 ? (
                            <div className="py-12 text-center bg-black/20 rounded-2xl border border-dashed border-white/10">
                                <FontAwesomeIcon icon={faUserShield} className="w-12 h-12 text-gray-700 mb-4" />
                                <h3 className="text-white font-bold italic">No whitelist entries found</h3>
                                <p className="text-gray-500 text-sm mt-1">Trust worthy users and roles should be added to bypass security.</p>
                            </div>
                        ) : (
                            <p className="text-[10px] text-gray-600 italic flex items-center gap-2 px-4">
                                <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 text-[#8b5cf6]/60" />
                                System-protected entries (Bot &amp; Owner) cannot be manually removed.
                            </p>
                        )}
                    </motion.div>
                )}

                {activeTab === 'violations' && (
                    <motion.div
                        key="violations"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Recent Violations</h2>
                        </div>

                        {violationsLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#8b5cf6] animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {violations?.map(v => (
                                    <div key={v._id} className="glass p-5 rounded-2xl border border-red-500/10 bg-red-500/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 border border-red-500/20">
                                                <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-500 w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-white font-bold">{v.actionType}</h3>
                                                    <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black uppercase">Violation</span>
                                                </div>
                                                <p className="text-sm text-gray-400 mt-1 italic">
                                                    User <span className="text-red-400 font-medium">@{v.userId}</span> attempted <span className="text-white">{v.attemptCount}</span> actions (Limit: {v.limitSet})
                                                </p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                                        <FontAwesomeIcon icon={faHistory} className="w-3 h-3" />
                                                        {new Date(v.createdAt).toLocaleString()}
                                                    </span>
                                                    {v.context.actionDetails && (
                                                        <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase tracking-tighter">
                                                            {v.context.actionDetails}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`px-4 py-2 rounded-xl border font-bold text-sm ${v.punishment.applied ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-gray-500/10 border-gray-500/20 text-gray-400'}`}>
                                                {(v.punishment.type === 'removeRoles' ? 'quarantine' : v.punishment.type).toUpperCase()} {v.punishment.applied ? 'APPLIED' : 'FAILED'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {violations?.length === 0 && (
                                    <div className="py-20 text-center bg-black/20 rounded-2xl border border-white/[0.03]">
                                        <div className="w-20 h-20 rounded-full bg-green-500/5 flex items-center justify-center mx-auto mb-4 border border-green-500/10">
                                            <FontAwesomeIcon icon={faUserCheck} className="w-10 h-10 text-green-500/30 font-bold" />
                                        </div>
                                        <h3 className="text-white font-bold italic">Safety First: No violations recorded!</h3>
                                        <p className="text-gray-500 text-sm mt-1">Everything seems quiet for now.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <SaveBar
                isVisible={!!hasUnsavedChanges || saving}
                isSaving={saving}
                onSave={handleSave}
                onDiscard={handleDiscard}
                message="You have unsaved changes in Security"
            />
        </div>
    )
}
