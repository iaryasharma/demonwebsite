"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faUserPlus,
    faSave,
    faArrowLeft,
    faSpinner,
    faCircleCheck,
    faClock,
    faShieldHalved,
    faCalendarDays,
    faHashtag,
    faRotateRight
} from "@fortawesome/free-solid-svg-icons"
import { toast } from "sonner"
import { SaveBar } from "@/components/dashboard/save-bar"
import Link from "next/link"
import { ChannelPicker } from "@/components/dashboard/settings/channel-picker"
import isEqual from "lodash/isEqual"
import cloneDeep from "lodash/cloneDeep"

interface AutoRoleConfig {
    enabled: boolean
    roleIds: string[]
    delay: number
    conditions: {
        accountAge: {
            enabled: boolean
            minDays: number
        }
        verificationRequired: boolean
    }
    logChannelId: string | null
}

interface Role {
    id: string
    name: string
    color: number
    position: number
}

// ── Helpers ─────────────────────────────────────────────
const DELAY_OPTIONS = [
    { label: "Instant (0s)", value: 0 },
    { label: "10 Seconds", value: 10 },
    { label: "30 Seconds", value: 30 },
    { label: "1 Minute", value: 60 },
    { label: "5 Minutes", value: 300 },
    { label: "10 Minutes", value: 600 },
    { label: "30 Minutes", value: 1800 },
    { label: "1 Hour", value: 3600 },
]

export default function AutoRolePage({
    params,
}: {
    params: Promise<{ guildId: string }>
}) {
    const { guildId } = React.use(params)
    const { data: session } = useSession()
    const queryClient = useQueryClient()

    const [config, setConfig] = useState<AutoRoleConfig | null>(null)
    const [originalConfig, setOriginalConfig] = useState<AutoRoleConfig | null>(null)
    const [saving, setSaving] = useState(false)

    const hasUnsavedChanges = config && originalConfig && !isEqual(config, originalConfig)

    const { data: serverConfig, isLoading: configLoading } = useQuery({
        queryKey: ["autorole", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/modules/autorole`)
            if (!res.ok) throw new Error("Failed to fetch autorole config")
            return res.json()
        },
        enabled: !!guildId,
    })

    const { data: roles = [], isLoading: rolesLoading, isFetching: rolesFetching, refetch: refetchRoles } = useQuery<Role[]>({
        queryKey: ["roles", guildId],
        queryFn: async ({ meta }) => {
            const forceRefresh = meta?.forceRefresh === true
            const url = forceRefresh
                ? `/api/guilds/${guildId}/roles?refresh=true`
                : `/api/guilds/${guildId}/roles`
            const res = await fetch(url)
            if (!res.ok) throw new Error("Failed to fetch roles")
            return res.json()
        },
        enabled: !!guildId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const handleRefreshRoles = () => {
        queryClient.invalidateQueries({ queryKey: ["roles", guildId] })
        refetchRoles({ meta: { forceRefresh: true } } as any)
    }

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
            const res = await fetch(`/api/guilds/${guildId}/modules/autorole`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            })
            if (res.ok) {
                setOriginalConfig(cloneDeep(config))
                toast.success("Auto-role settings saved!")
            } else {
                toast.error("Failed to save auto-role settings")
            }
        } catch (error) {
            console.error("Failed to save autorole config:", error)
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

    const toggleRole = (roleId: string) => {
        if (!config) return
        const isSelected = config.roleIds.includes(roleId)
        if (isSelected) {
            setConfig({ ...config, roleIds: config.roleIds.filter(id => id !== roleId) })
        } else {
            if (config.roleIds.length >= 10) return // Max 10 limit
            setConfig({ ...config, roleIds: [...config.roleIds, roleId] })
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                            <FontAwesomeIcon icon={faUserPlus} className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Auto Role Setup</h1>
                            <p className="text-gray-400 mt-1">
                                Automatically assign roles to new members when they join.
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Settings */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Roles Configuration */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-2xl border border-white/[0.06] p-6 space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Roles to Assign</h3>
                                <p className="text-sm text-gray-400">Select which roles members receive upon joining. Maximun 10.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleRefreshRoles}
                                    disabled={rolesFetching}
                                    title="Refresh role list"
                                    className="p-2 rounded-xl bg-black/40 border border-white/[0.06] text-gray-400 hover:text-white hover:border-[#8b5cf6]/50 transition-colors disabled:opacity-40"
                                >
                                    <FontAwesomeIcon icon={faRotateRight} className={`w-3.5 h-3.5 ${rolesFetching ? 'animate-spin' : ''}`} />
                                </button>
                                <span className={`text-sm font-medium px-3 py-1 rounded-full ${config.roleIds.length >= 10 ? 'bg-red-500/20 text-red-400' : 'bg-[#8b5cf6]/20 text-[#8b5cf6]'}`}>
                                    {config.roleIds.length}/10 selected
                                </span>
                            </div>
                        </div>

                        <div className="bg-black/40 rounded-xl border border-white/[0.06] p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {assignableRoles.map((role) => {
                                    const isSelected = config.roleIds.includes(role.id)
                                    const isDisabled = !isSelected && config.roleIds.length >= 10

                                    return (
                                        <div
                                            key={role.id}
                                            onClick={() => !isDisabled && toggleRole(role.id)}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isDisabled ? 'opacity-50 cursor-not-allowed border-transparent' : 'cursor-pointer'} ${isSelected ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]/50' : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'}`}
                                        >
                                            <div className="relative flex items-center justify-center w-5 h-5 rounded border border-gray-600 bg-black/50 shrink-0">
                                                {isSelected && <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4 text-[#8b5cf6]" />}
                                            </div>
                                            <div
                                                className="w-3 h-3 rounded-full shrink-0"
                                                style={{ backgroundColor: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99aab5' }}
                                            />
                                            <span className={`text-sm truncate ${isSelected ? 'text-white font-medium' : 'text-gray-300'}`}>
                                                {role.name}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Delay & Conditions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass rounded-2xl border border-white/[0.06] p-6 space-y-6"
                    >
                        <h3 className="text-xl font-bold text-white pb-2 border-b border-white/[0.06]">Assignment Rules</h3>

                        {/* Delay */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-white">
                                <FontAwesomeIcon icon={faClock} className="text-[#8b5cf6]" />
                                <span className="font-semibold">Assignment Delay</span>
                            </div>
                            <p className="text-sm text-gray-400">Delay assigning roles to help mitigate bot raids.</p>
                            <select
                                value={config.delay}
                                onChange={(e) => setConfig({ ...config, delay: parseInt(e.target.value) })}
                                className="w-full bg-black/40 border border-white/[0.06] text-white text-sm rounded-xl focus:ring-[#8b5cf6] focus:border-[#8b5cf6] block p-3"
                            >
                                {DELAY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Minimum Account Age */}
                        <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white">
                                    <FontAwesomeIcon icon={faCalendarDays} className="text-emerald-400" />
                                    <span className="font-semibold">Minimum Account Age</span>
                                </div>
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={config.conditions.accountAge.enabled}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                conditions: {
                                                    ...config.conditions,
                                                    accountAge: { ...config.conditions.accountAge, enabled: e.target.checked }
                                                }
                                            })}
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${config.conditions.accountAge.enabled ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.conditions.accountAge.enabled ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                </label>
                            </div>
                            <p className="text-sm text-gray-400">Accounts younger than this threshold will not receive auto-roles.</p>

                            <AnimatePresence>
                                {config.conditions.accountAge.enabled && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <div className="flex items-center gap-3 mt-3">
                                            <input
                                                type="number"
                                                min="1"
                                                max="365"
                                                value={config.conditions.accountAge.minDays}
                                                onChange={(e) => setConfig({
                                                    ...config,
                                                    conditions: {
                                                        ...config.conditions,
                                                        accountAge: { ...config.conditions.accountAge, minDays: parseInt(e.target.value) || 0 }
                                                    }
                                                })}
                                                className="w-24 bg-black/40 border border-white/[0.06] text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5"
                                            />
                                            <span className="text-sm text-gray-300">Days old</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Verification Gate */}
                        <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white">
                                    <FontAwesomeIcon icon={faShieldHalved} className="text-blue-400" />
                                    <span className="font-semibold">Wait for Verification</span>
                                </div>
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={config.conditions.verificationRequired}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                conditions: {
                                                    ...config.conditions,
                                                    verificationRequired: e.target.checked
                                                }
                                            })}
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${config.conditions.verificationRequired ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.conditions.verificationRequired ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                </label>
                            </div>
                            <p className="text-sm text-gray-400">If your server has Verification enabled, Auto-roles will only be assigned <strong className="text-gray-200">after</strong> the user successfully verifies, rather than instantly upon joining.</p>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Logging & Actions */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-2xl border border-white/[0.06] p-6 space-y-6 sticky top-24"
                    >
                        <div>
                            <div className="flex items-center gap-2 text-white mb-2">
                                <FontAwesomeIcon icon={faHashtag} className="text-gray-400" />
                                <h3 className="text-lg font-bold">Assignment Logs</h3>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">Select a channel to receive logs when members are given auto-roles, or when they are skipped due to account age limitations.</p>

                            <ChannelPicker
                                guildId={guildId}
                                value={config.logChannelId || ""}
                                onChange={(val) => setConfig({ ...config, logChannelId: val || null })}
                            />
                        </div>

                        <div className="pt-6 border-t border-white/[0.06]">
                            <p className="text-sm text-gray-400">Settings are managed via the floating dock at the bottom of the screen.</p>
                        </div>
                    </motion.div>
                </div>
            </div>

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
                                ⚠️ <span>You have unsaved changes in AutoRole</span>
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
