"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faGear,
    faSpinner,
    faTerminal,
    faDoorOpen,
    faDoorClosed,
    faClipboardList,
    faUserPlus,
    faShieldHalved,
    faCheck,
    faTimes,
    faArrowRight,
    faRotateRight,
    faBullhorn,
    faFloppyDisk,
    faXmark
} from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"
import { ChannelPicker } from "@/components/dashboard/settings/channel-picker"
import { toast } from "sonner"

interface ServerSettings {
    guildId: string
    prefix: string
    botUpdatesChannelId: string | null
    disabledChannels: string[]
    modules: {
        welcome: { enabled: boolean; channelId?: string | null; messageId?: string | null }
        leave: { enabled: boolean; channelId?: string | null; messageId?: string | null }
        logging: { enabled: boolean; channelId?: string | null; events?: Record<string, boolean> }
        autorole: { enabled: boolean; roleIds?: string[]; delay?: number }
        verification: { enabled: boolean; type?: string; roleId?: string | null; channelId?: string | null }
    }
}

interface Channel {
    id: string
    name: string
}

interface Role {
    id: string
    name: string
    color: number
}

function StatusBadge({ enabled }: { enabled: boolean }) {
    if (enabled) {
        return (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/20 flex items-center gap-1.5 shrink-0">
                <FontAwesomeIcon icon={faCheck} className="w-3 h-3" /> Enabled
            </span>
        )
    }
    return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/15 text-gray-400 border border-gray-500/20 flex items-center gap-1.5 shrink-0">
            <FontAwesomeIcon icon={faTimes} className="w-3 h-3" /> Disabled
        </span>
    )
}

function ChannelMention({ channelId, channels }: { channelId?: string | null, channels: Channel[] }) {
    if (!channelId) return <span className="text-gray-500 italic">Not set</span>
    const channel = channels.find(c => c.id === channelId)
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.05] text-blue-300 font-medium">
            <span className="text-blue-500/50">#</span>
            {channel ? channel.name : 'Unknown Channel'}
        </span>
    )
}

function RoleMention({ roleId, roles }: { roleId?: string | null, roles: Role[] }) {
    if (!roleId) return <span className="text-gray-500 italic">Not set</span>
    const role = roles.find(r => r.id === roleId)
    const colorStr = role?.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99aab5'
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.05] font-medium" style={{ color: colorStr }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorStr }} />
            {role ? role.name : 'Unknown Role'}
        </span>
    )
}

export default function ServerSettingsPage({
    params,
}: {
    params: Promise<{ guildId: string }>
}) {
    const { guildId } = React.use(params)
    const { data: session, status } = useSession()
    const queryClient = useQueryClient()

    const [botUpdatesChannelId, setBotUpdatesChannelId] = useState<string | null>(null)
    const [originalBotUpdatesChannelId, setOriginalBotUpdatesChannelId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)


    const hasBotUpdatesChange = botUpdatesChannelId !== originalBotUpdatesChannelId

    const handleSaveBotUpdates = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/guilds/${guildId}/server-settings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ botUpdatesChannelId }),
            })
            if (res.ok) {
                setOriginalBotUpdatesChannelId(botUpdatesChannelId)
                queryClient.invalidateQueries({ queryKey: ["server-settings", guildId] })
                toast.success("Bot updates channel saved!")
            } else {
                toast.error("Failed to save bot updates channel")
            }
        } catch {
            toast.error("An error occurred while saving")
        } finally {
            setSaving(false)
        }
    }

    const handleDiscardBotUpdates = () => {
        setBotUpdatesChannelId(originalBotUpdatesChannelId)
    }

    const { data: settings, isLoading: settingsLoading } = useQuery<ServerSettings>({
        queryKey: ["server-settings", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/server-settings`)
            if (!res.ok) throw new Error("Failed to fetch settings")
            return res.json()
        },
        enabled: status === "authenticated" && !!guildId
    })

    useEffect(() => {
        if (settings && originalBotUpdatesChannelId === null) {
            setBotUpdatesChannelId(settings.botUpdatesChannelId ?? null)
            setOriginalBotUpdatesChannelId(settings.botUpdatesChannelId ?? null)
        }
    }, [settings, originalBotUpdatesChannelId])

    const { data: channels = [], isLoading: channelsLoading, isFetching: channelsFetching, refetch: refetchChannels } = useQuery<Channel[]>({
        queryKey: ["channels", guildId],
        queryFn: async ({ meta }) => {
            const forceRefresh = meta?.forceRefresh === true
            const url = forceRefresh
                ? `/api/guilds/${guildId}/channels?refresh=true`
                : `/api/guilds/${guildId}/channels`
            const res = await fetch(url)
            if (!res.ok) throw new Error("Failed to fetch channels")
            return res.json()
        },
        enabled: status === "authenticated" && !!guildId,
        staleTime: 5 * 60 * 1000, // 5 minutes
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
        enabled: status === "authenticated" && !!guildId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const handleRefreshAll = () => {
        queryClient.invalidateQueries({ queryKey: ["channels", guildId] })
        queryClient.invalidateQueries({ queryKey: ["roles", guildId] })
        refetchChannels({ meta: { forceRefresh: true } } as any)
        refetchRoles({ meta: { forceRefresh: true } } as any)
    }

    if (settingsLoading || channelsLoading || rolesLoading || status === "loading") {
        return (
            <div className="flex items-center justify-center py-20">
                <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#8b5cf6] animate-spin" />
            </div>
        )
    }

    if (!settings) return <div>Failed to load settings data.</div>

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-4 mb-10 border-b border-white/[0.06] pb-6"
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#8b5cf6]/20">
                        <FontAwesomeIcon icon={faGear} className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Server Settings Overview</h1>
                        <p className="text-gray-400 mt-1">A bird's-eye view of all bot configurations for this server.</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleRefreshAll}
                    disabled={channelsFetching || rolesFetching}
                    title="Refresh channels &amp; roles"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-gray-400 hover:text-white hover:border-[#8b5cf6]/50 transition-colors disabled:opacity-40 shrink-0"
                >
                    <FontAwesomeIcon icon={faRotateRight} className={`w-4 h-4 ${channelsFetching || rolesFetching ? 'animate-spin' : ''}`} />
                    <span className="text-sm">Refresh</span>
                </button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="glass rounded-2xl border border-white/[0.06] p-6 col-span-1 md:col-span-2 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-50 group-hover:opacity-100" />

                    <div className="flex items-center gap-3 mb-6 relative">
                        <FontAwesomeIcon icon={faTerminal} className="w-5 h-5 text-[#a78bfa]" />
                        <h2 className="text-xl font-bold text-white">General Information</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Bot Prefix</p>
                            <p className="text-2xl font-mono text-white bg-black/30 w-fit px-4 py-1 rounded-lg border border-white/[0.05]">
                                {settings.prefix}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Ignored Command Channels</p>
                            <div className="flex flex-wrap gap-2">
                                {settings.disabledChannels.length > 0 ? (
                                    settings.disabledChannels.map(id => (
                                        <ChannelMention key={id} channelId={id} channels={channels} />
                                    ))
                                ) : (
                                    <span className="text-gray-400 bg-black/20 px-3 py-1 rounded border border-white/[0.03]">None specified. Bot responds in all channels.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bot Updates Channel */}
                    <div className="mt-6 pt-6 border-t border-white/[0.06] relative">
                        <div className="flex items-center gap-2 mb-3">
                            <FontAwesomeIcon icon={faBullhorn} className="w-4 h-4 text-[#a78bfa]" />
                            <p className="text-sm font-semibold text-white">Bot Updates Channel</p>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">The channel where the bot posts announcements via <span className="font-mono bg-black/30 px-1.5 py-0.5 rounded border border-white/[0.05]">/broadcast</span>. Leave empty to disable.</p>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex-1 min-w-[200px] max-w-sm">
                                <ChannelPicker
                                    guildId={guildId}
                                    value={botUpdatesChannelId || ""}
                                    onChange={(val: string | null) => setBotUpdatesChannelId(val || null)}
                                />
                            </div>
                            {hasBotUpdatesChange && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSaveBotUpdates}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        <FontAwesomeIcon icon={faFloppyDisk} className={`w-3.5 h-3.5 ${saving ? 'animate-pulse' : ''}`} />
                                        {saving ? "Saving…" : "Save"}
                                    </button>
                                    <button
                                        onClick={handleDiscardBotUpdates}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-gray-400 hover:text-white text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                                        Discard
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Welcome Module */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl border border-white/[0.06] p-6 flex flex-col hover:border-white/[0.1] transition-colors"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                <FontAwesomeIcon icon={faDoorOpen} className="w-4 h-4 text-pink-400" />
                            </div>
                            <h2 className="text-lg font-bold text-white">Welcome</h2>
                        </div>
                        <StatusBadge enabled={settings.modules.welcome.enabled} />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-[100px_1fr] items-center gap-4 border-b border-white/[0.02] pb-3">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel</span>
                            <div><ChannelMention channelId={settings.modules.welcome.channelId} channels={channels} /></div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</span>
                            <span className="text-sm text-gray-300 truncate">{settings.modules.welcome.messageId ? "Custom ID Set" : "Default Embed"}</span>
                        </div>
                    </div>

                    <Link href={`/dashboard/${guildId}/modules/welcome`} className="mt-6 text-sm text-[#8b5cf6] hover:text-[#a78bfa] font-medium flex items-center gap-2 group w-fit">
                        Configure Welcome <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

                {/* Leave Module */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="glass rounded-2xl border border-white/[0.06] p-6 flex flex-col hover:border-white/[0.1] transition-colors"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                <FontAwesomeIcon icon={faDoorClosed} className="w-4 h-4 text-orange-400" />
                            </div>
                            <h2 className="text-lg font-bold text-white">Leave</h2>
                        </div>
                        <StatusBadge enabled={settings.modules.leave.enabled} />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-[100px_1fr] items-center gap-4 border-b border-white/[0.02] pb-3">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel</span>
                            <div><ChannelMention channelId={settings.modules.leave.channelId} channels={channels} /></div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</span>
                            <span className="text-sm text-gray-300 truncate">{settings.modules.leave.messageId ? "Custom ID Set" : "Default Embed"}</span>
                        </div>
                    </div>

                    <Link href={`/dashboard/${guildId}/modules/leave`} className="mt-6 text-sm text-[#8b5cf6] hover:text-[#a78bfa] font-medium flex items-center gap-2 group w-fit">
                        Configure Leave <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

                {/* Auto Role Module */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl border border-white/[0.06] p-6 flex flex-col hover:border-white/[0.1] transition-colors"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <FontAwesomeIcon icon={faUserPlus} className="w-4 h-4 text-emerald-400" />
                            </div>
                            <h2 className="text-lg font-bold text-white">Auto Role</h2>
                        </div>
                        <StatusBadge enabled={settings.modules.autorole.enabled} />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-[100px_1fr] items-start gap-4 border-b border-white/[0.02] pb-3">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-1">Roles</span>
                            <div className="flex flex-wrap gap-2">
                                {settings.modules.autorole.roleIds && settings.modules.autorole.roleIds.length > 0 ? (
                                    settings.modules.autorole.roleIds.map(id => <RoleMention key={id} roleId={id} roles={roles} />)
                                ) : (
                                    <span className="text-gray-500 text-sm">None selected</span>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Delay</span>
                            <span className="text-sm text-gray-300 font-medium">
                                {settings.modules.autorole.delay ? `${settings.modules.autorole.delay} seconds` : "Instant"}
                            </span>
                        </div>
                    </div>

                    <Link href={`/dashboard/${guildId}/modules/autorole`} className="mt-6 text-sm text-[#8b5cf6] hover:text-[#a78bfa] font-medium flex items-center gap-2 group w-fit">
                        Configure Auto Role <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

                {/* Verification Module */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="glass rounded-2xl border border-white/[0.06] p-6 flex flex-col hover:border-white/[0.1] transition-colors"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4 text-blue-400" />
                            </div>
                            <h2 className="text-lg font-bold text-white">Verification</h2>
                        </div>
                        <StatusBadge enabled={settings.modules.verification.enabled} />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-[100px_1fr] items-center gap-4 border-b border-white/[0.02] pb-3">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel</span>
                            <div><ChannelMention channelId={settings.modules.verification.channelId} channels={channels} /></div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-4 border-b border-white/[0.02] pb-3">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</span>
                            <span className="text-sm text-white capitalize bg-black/30 px-3 py-1 rounded w-fit border border-white/[0.05]">
                                {settings.modules.verification.type || "button"}
                            </span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Verified Role</span>
                            <div><RoleMention roleId={settings.modules.verification.roleId} roles={roles} /></div>
                        </div>
                    </div>

                    <Link href={`/dashboard/${guildId}/modules/verification`} className="mt-6 text-sm text-[#8b5cf6] hover:text-[#a78bfa] font-medium flex items-center gap-2 group w-fit">
                        Configure Verification <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

                {/* Logging Module (Full Width) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-2xl border border-white/[0.06] p-6 col-span-1 md:col-span-2 hover:border-white/[0.1] transition-colors"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-500/20 flex items-center justify-center border border-white/[0.05]">
                                <FontAwesomeIcon icon={faClipboardList} className="w-4 h-4 text-gray-400" />
                            </div>
                            <h2 className="text-lg font-bold text-white">Action Logging</h2>
                        </div>
                        <StatusBadge enabled={settings.modules.logging.enabled} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                        <div className="space-y-4">
                            <div className="grid grid-cols-[120px_1fr] items-center gap-4 border-b border-white/[0.02] pb-3">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Output Channel</span>
                                <div><ChannelMention channelId={settings.modules.logging.channelId} channels={channels} /></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-[120px_1fr] items-start gap-4 border-b border-white/[0.02] pb-3 md:border-b-0 md:pb-0">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-1">Active Events</span>
                                <div className="text-sm text-gray-300">
                                    {settings.modules.logging.events ? (
                                        Object.values(settings.modules.logging.events).filter(v => v).length > 0 ? (
                                            `${Object.values(settings.modules.logging.events).filter(v => v).length} event streams enabled`
                                        ) : "No events enabled"
                                    ) : "Logging events tracking loading..."}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link href={`/dashboard/${guildId}/modules/logging`} className="mt-6 text-sm text-[#8b5cf6] hover:text-[#a78bfa] font-medium flex items-center gap-2 group w-fit">
                        Configure Action Logging <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

            </div>
        </div>
    )
}
