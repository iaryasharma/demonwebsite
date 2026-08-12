"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faClipboardList,
    faArrowLeft,
    faSpinner,
    faShieldHalved,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"
import { ChannelPicker } from "@/components/dashboard/settings/channel-picker"
import isEqual from "lodash/isEqual"
import cloneDeep from "lodash/cloneDeep"
import { SaveBar } from "@/components/dashboard/save-bar"
import { toast } from "sonner"
import {
    ROUTABLE_CATEGORIES,
    buildMigratedCategoryModes,
    type CategoryRoutingMode,
    type RoutableCategory,
} from "@/lib/logging-constants"

type ChannelKey = RoutableCategory | "emoji" | "soundboard"

type EventKey =
    | "memberJoin"
    | "memberLeave"
    | "ban"
    | "unban"
    | "kick"
    | "messageDelete"
    | "messageEdit"
    | "modCommand"
    | "verification"
    | "autorole"
    | "roleCreate"
    | "roleDelete"
    | "roleUpdate"
    | "channelCreate"
    | "channelDelete"
    | "channelUpdate"
    | "emojiCreate"
    | "emojiUpdate"
    | "emojiDelete"
    | "soundboardCreate"
    | "soundboardUpdate"
    | "soundboardDelete"
    | "serverUpdate"
    | "nicknameUpdate"
    | "memberRoleAdd"
    | "memberRoleRemove"
    | "memberTimeout"
    | "memberUntimeout"
    | "voiceJoin"
    | "voiceLeave"
    | "voiceMove"
    | "voiceKick"
    | "voiceMute"
    | "voiceDeafen"
    | "ticketCreate"
    | "ticketClose"
    | "ticketReopen"
    | "ticketClaim"
    | "ticketUnclaim"
    | "ticketPriority"
    | "ticketUserAdd"
    | "ticketUserRemove"
    | "ticketTransfer"
    | "securityViolation"

interface LoggingConfig {
    enabled: boolean
    /** @deprecated kept for migration display only */
    mode?: "single" | "multi" | "granular"
    categoryModes: Record<RoutableCategory, CategoryRoutingMode>
    categoryRoutingMigrated: boolean
    fallbackOnly: boolean
    channelId: string | null
    channels: Record<ChannelKey, string | null>
    eventChannels: Record<EventKey, string | null>
    events: Record<EventKey, boolean>
}

const EVENT_LABELS: Record<EventKey, string> = {
    memberJoin: "Member Join",
    memberLeave: "Member Leave",
    ban: "Ban",
    unban: "Unban",
    kick: "Kick",
    messageDelete: "Message Delete",
    messageEdit: "Message Edit",
    modCommand: "Mod Command",
    verification: "Verification",
    autorole: "Auto-Role",
    roleCreate: "Role Create",
    roleDelete: "Role Delete",
    roleUpdate: "Role Update",
    channelCreate: "Channel Create",
    channelDelete: "Channel Delete",
    channelUpdate: "Channel Update",
    emojiCreate: "Emoji Create",
    emojiUpdate: "Emoji Update",
    emojiDelete: "Emoji Delete",
    soundboardCreate: "Soundboard Create",
    soundboardUpdate: "Soundboard Update",
    soundboardDelete: "Soundboard Delete",
    serverUpdate: "Server Update",
    nicknameUpdate: "Nickname Update",
    memberRoleAdd: "Member Role Add",
    memberRoleRemove: "Member Role Remove",
    memberTimeout: "Member Timeout",
    memberUntimeout: "Member Untimeout",
    voiceJoin: "Voice Join",
    voiceLeave: "Voice Leave",
    voiceMove: "Voice Move",
    voiceKick: "Voice Kick",
    voiceMute: "Voice Mute",
    voiceDeafen: "Voice Deafen",
    ticketCreate: "Ticket Create",
    ticketClose: "Ticket Close",
    ticketReopen: "Ticket Reopen",
    ticketClaim: "Ticket Claim",
    ticketUnclaim: "Ticket Unclaim",
    ticketPriority: "Ticket Priority",
    ticketUserAdd: "Ticket User Add",
    ticketUserRemove: "Ticket User Remove",
    ticketTransfer: "Ticket Transfer",
    securityViolation: "Security Violation",
}

const CATEGORY_META: {
    key: RoutableCategory
    label: string
    blurb: string
    events: EventKey[]
}[] = [
    {
        key: "moderation",
        label: "Moderation",
        blurb: "Discord audit actions: bans, kicks, timeouts",
        events: ["ban", "unban", "kick", "memberTimeout", "memberUntimeout"],
    },
    {
        key: "modCommands",
        label: "Mod Commands",
        blurb: "Bot moderation command executions (ban, mute, purge, …)",
        events: ["modCommand"],
    },
    {
        key: "messages",
        label: "Messages",
        blurb: "Message deletes and edits",
        events: ["messageDelete", "messageEdit"],
    },
    {
        key: "members",
        label: "Members",
        blurb: "Joins, leaves, nicknames, role adds/removes",
        events: ["memberJoin", "memberLeave", "nicknameUpdate", "memberRoleAdd", "memberRoleRemove"],
    },
    {
        key: "server",
        label: "Server",
        blurb: "Roles, channels, and server settings",
        events: ["roleCreate", "roleDelete", "roleUpdate", "channelCreate", "channelDelete", "channelUpdate", "serverUpdate"],
    },
    {
        key: "expressions",
        label: "Expressions",
        blurb: "Emoji and soundboard (shared channel; optional splits below)",
        events: ["emojiCreate", "emojiUpdate", "emojiDelete", "soundboardCreate", "soundboardUpdate", "soundboardDelete"],
    },
    {
        key: "voice",
        label: "Voice",
        blurb: "Voice join, leave, move, mute, deafen, kick",
        events: ["voiceJoin", "voiceLeave", "voiceMove", "voiceKick", "voiceMute", "voiceDeafen"],
    },
    {
        key: "verification",
        label: "Verification",
        blurb: "Member verification events",
        events: ["verification"],
    },
    {
        key: "autorole",
        label: "Autorole",
        blurb: "Auto-role assignments",
        events: ["autorole"],
    },
    {
        key: "tickets",
        label: "Tickets",
        blurb: "Ticket system events",
        events: [
            "ticketCreate",
            "ticketClose",
            "ticketReopen",
            "ticketClaim",
            "ticketUnclaim",
            "ticketPriority",
            "ticketUserAdd",
            "ticketUserRemove",
            "ticketTransfer",
        ],
    },
    {
        key: "security",
        label: "Security",
        blurb: "Security violations and nuke attempts",
        events: ["securityViolation"],
    },
]

const CHANNEL_KEYS: ChannelKey[] = [...ROUTABLE_CATEGORIES, "emoji", "soundboard"]
const EVENT_KEYS = Object.keys(EVENT_LABELS) as EventKey[]

function emptyChannels(): Record<ChannelKey, string | null> {
    return Object.fromEntries(CHANNEL_KEYS.map(k => [k, null])) as Record<ChannelKey, string | null>
}

function emptyEventChannels(): Record<EventKey, string | null> {
    return Object.fromEntries(EVENT_KEYS.map(k => [k, null])) as Record<EventKey, string | null>
}

function defaultEvents(): Record<EventKey, boolean> {
    const out = Object.fromEntries(EVENT_KEYS.map(k => [k, true])) as Record<EventKey, boolean>
    out.verification = false
    out.autorole = false
    return out
}

function normalizeConfig(raw: Partial<LoggingConfig> & Record<string, unknown> | null | undefined): LoggingConfig {
    const legacyMode = (raw?.mode as LoggingConfig["mode"]) || "single"
    const migrated = Boolean(raw?.categoryRoutingMigrated)
    const categoryModes =
        (raw?.categoryModes as LoggingConfig["categoryModes"]) ||
        buildMigratedCategoryModes(migrated ? "multi" : legacyMode)

    // Fill any missing category mode keys
    const modes = { ...buildMigratedCategoryModes("multi"), ...categoryModes }

    let fallbackOnly = Boolean(raw?.fallbackOnly)
    if (!migrated && legacyMode === "single") fallbackOnly = true

    return {
        enabled: Boolean(raw?.enabled),
        mode: legacyMode,
        categoryModes: modes,
        categoryRoutingMigrated: true,
        fallbackOnly,
        channelId: (raw?.channelId as string | null) ?? null,
        channels: { ...emptyChannels(), ...(raw?.channels || {}) },
        eventChannels: { ...emptyEventChannels(), ...(raw?.eventChannels || {}) },
        events: { ...defaultEvents(), ...(raw?.events || {}) },
    }
}

function Toggle({
    checked,
    onChange,
    accent = "brand",
}: {
    checked: boolean
    onChange: (next: boolean) => void
    accent?: "brand" | "green"
}) {
    const onCls = accent === "green" ? "bg-green-500" : "bg-[#8b5cf6]"
    return (
        <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="relative inline-flex shrink-0">
            <span className={`block h-6 w-10 rounded-full transition-colors ${checked ? onCls : "bg-zinc-700"}`} />
            <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : ""}`} />
        </button>
    )
}

function CategorySection({
    guildId,
    cat,
    config,
    open,
    onToggleOpen,
    onChange,
}: {
    guildId: string
    cat: (typeof CATEGORY_META)[number]
    config: LoggingConfig
    open: boolean
    onToggleOpen: () => void
    onChange: (next: LoggingConfig) => void
}) {
    const mode = config.categoryModes[cat.key] || "category"
    const enabledInCat = cat.events.filter(e => config.events[e]).length

    const setMode = (next: CategoryRoutingMode) => {
        onChange({
            ...config,
            fallbackOnly: false,
            categoryModes: { ...config.categoryModes, [cat.key]: next },
        })
    }

    const setChannel = (key: ChannelKey, val: string | null) => {
        const next: LoggingConfig = {
            ...config,
            fallbackOnly: false,
            channels: { ...config.channels, [key]: val },
        }
        if (key === "security") {
            next.eventChannels = { ...next.eventChannels, securityViolation: val }
        }
        onChange(next)
    }

    return (
        <div className={`rounded-xl border ${cat.key === "security" ? "border-red-500/20 bg-red-500/[0.03]" : "border-white/[0.06] bg-black/20"}`}>
            <button
                type="button"
                onClick={onToggleOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`font-semibold ${cat.key === "security" ? "text-red-300" : "text-white"}`}>
                            {cat.label}
                        </h4>
                        <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                            {mode}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                            {enabledInCat}/{cat.events.length} events
                        </span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500">{cat.blurb}</p>
                </div>
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="space-y-4 border-t border-white/[0.05] px-4 pb-4 pt-3">
                    <div className="flex flex-wrap gap-2">
                        {(
                            [
                                { id: "category" as const, label: "Category", desc: "One channel for the whole category" },
                                { id: "granular" as const, label: "Granular", desc: "Optional channel per event" },
                            ]
                        ).map(opt => {
                            const active = mode === opt.id
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setMode(opt.id)}
                                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                                        active
                                            ? "border-[#8b5cf6] bg-[#8b5cf6]/15 text-white"
                                            : "border-white/[0.06] bg-black/30 text-zinc-400 hover:border-white/15"
                                    }`}
                                >
                                    <div className="text-sm font-semibold">{opt.label}</div>
                                    <div className="text-[11px] opacity-70">{opt.desc}</div>
                                </button>
                            )
                        })}
                    </div>

                    <div className="space-y-1">
                        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
                            Category channel
                        </label>
                        <ChannelPicker
                            guildId={guildId}
                            value={config.channels[cat.key] || ""}
                            onChange={val => setChannel(cat.key, val || null)}
                        />
                    </div>

                    {cat.key === "expressions" && (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-zinc-400">Emoji override (optional)</label>
                                <ChannelPicker
                                    guildId={guildId}
                                    value={config.channels.emoji || ""}
                                    onChange={val => setChannel("emoji", val || null)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-zinc-400">Soundboard override (optional)</label>
                                <ChannelPicker
                                    guildId={guildId}
                                    value={config.channels.soundboard || ""}
                                    onChange={val => setChannel("soundboard", val || null)}
                                />
                            </div>
                        </div>
                    )}

                    {mode === "granular" && (
                        <div className="space-y-2">
                            <p className="text-xs text-zinc-500">
                                Per-event channels (leave blank to inherit category → fallback).
                            </p>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {cat.events.map(eventKey => (
                                    <div key={eventKey} className="space-y-1 rounded-lg border border-white/[0.04] bg-black/25 p-3">
                                        <label className="block text-sm font-medium text-zinc-300">
                                            {EVENT_LABELS[eventKey]}
                                        </label>
                                        {eventKey === "securityViolation" ? (
                                            <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-2">
                                                <p className="mb-2 flex items-center gap-1.5 text-[11px] text-red-400">
                                                    <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3" />
                                                    Uses Security category channel
                                                </p>
                                                <ChannelPicker
                                                    guildId={guildId}
                                                    value={config.channels.security || ""}
                                                    onChange={val => setChannel("security", val || null)}
                                                />
                                            </div>
                                        ) : (
                                            <ChannelPicker
                                                guildId={guildId}
                                                value={config.eventChannels[eventKey] || ""}
                                                onChange={val =>
                                                    onChange({
                                                        ...config,
                                                        fallbackOnly: false,
                                                        eventChannels: {
                                                            ...config.eventChannels,
                                                            [eventKey]: val || null,
                                                        },
                                                    })
                                                }
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Event toggles</p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="rounded-md border border-white/[0.08] px-2 py-1 text-[11px] text-zinc-300 hover:text-emerald-300"
                                    onClick={() => {
                                        const events = { ...config.events }
                                        for (const e of cat.events) events[e] = true
                                        onChange({ ...config, events })
                                    }}
                                >
                                    Enable all
                                </button>
                                <button
                                    type="button"
                                    className="rounded-md border border-white/[0.08] px-2 py-1 text-[11px] text-zinc-300 hover:text-red-300"
                                    onClick={() => {
                                        const events = { ...config.events }
                                        for (const e of cat.events) events[e] = false
                                        onChange({ ...config, events })
                                    }}
                                >
                                    Disable all
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {cat.events.map(key => (
                                <label
                                    key={key}
                                    className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/[0.04] bg-black/25 px-3 py-2.5"
                                >
                                    <span className="text-sm font-medium text-zinc-300">{EVENT_LABELS[key]}</span>
                                    <Toggle
                                        checked={Boolean(config.events[key])}
                                        onChange={next =>
                                            onChange({
                                                ...config,
                                                events: { ...config.events, [key]: next },
                                            })
                                        }
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function LoggingModulePage({
    params,
}: {
    params: Promise<{ guildId: string }>
}) {
    const { guildId } = React.use(params)
    const [config, setConfig] = useState<LoggingConfig | null>(null)
    const [originalConfig, setOriginalConfig] = useState<LoggingConfig | null>(null)
    const [saving, setSaving] = useState(false)
    const [openCats, setOpenCats] = useState<Set<string>>(() => new Set(["moderation", "modCommands", "messages"]))

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
            const normalized = normalizeConfig(serverConfig)
            setConfig(cloneDeep(normalized))
            setOriginalConfig(cloneDeep(normalized))
        }
    }, [serverConfig, originalConfig])

    const enabledCount = useMemo(() => {
        if (!config) return 0
        return EVENT_KEYS.filter(k => config.events[k]).length
    }, [config])

    const handleSave = async () => {
        if (!config) return
        setSaving(true)
        try {
            const payload = {
                ...config,
                categoryRoutingMigrated: true,
            }
            const res = await fetch(`/api/guilds/${guildId}/modules/logging`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (res.ok) {
                setOriginalConfig(cloneDeep(config))
                toast.success("Logging configuration saved!")
            } else {
                toast.error("Failed to save logging configuration")
            }
        } catch (error) {
            console.error("Failed to save logging config:", error)
            toast.error("An error occurred while saving")
        } finally {
            setSaving(false)
        }
    }

    if (configLoading || !config) {
        return (
            <div className="flex items-center justify-center py-20">
                <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin text-[#8b5cf6]" />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8 pb-24">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <Link
                        href={`/dashboard/${guildId}/modules`}
                        className="mb-2 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5" />
                        Back to Modules
                    </Link>
                    <div className="mt-2 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                            <FontAwesomeIcon icon={faClipboardList} className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Logging Module</h1>
                            <p className="mt-1 text-zinc-400">
                                {EVENT_KEYS.length} events · {enabledCount} enabled · per-category routing
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Toggle
                        checked={config.enabled}
                        accent="green"
                        onChange={enabled => setConfig({ ...config, enabled })}
                    />
                    <span className="font-medium text-white">
                        {config.enabled ? "Module Enabled" : "Module Disabled"}
                    </span>
                </div>
            </div>

            <div className="space-y-6 rounded-2xl border border-white/[0.06] bg-zinc-950/80 p-6">
                {/* Fallback */}
                <div className="space-y-4">
                    <h3 className="border-b border-white/[0.06] pb-2 text-xl font-bold text-white">Fallback Channel</h3>
                    <p className="text-sm text-zinc-400">
                        Last-resort channel when a category (or event) has no channel set. Matches the bot&apos;s{" "}
                        <code className="text-zinc-300">/logs channel</code> fallback.
                    </p>
                    <ChannelPicker
                        guildId={guildId}
                        value={config.channelId || ""}
                        onChange={val => setConfig({ ...config, channelId: val || null })}
                    />

                    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-white/[0.06] bg-black/25 p-4">
                        <div>
                            <div className="font-semibold text-white">Fallback only</div>
                            <p className="mt-1 text-xs text-zinc-500">
                                Send every event to the fallback channel and ignore category / event channels
                                (same as legacy single mode). Turn this off to configure categories below.
                            </p>
                        </div>
                        <Toggle
                            checked={config.fallbackOnly}
                            onChange={fallbackOnly => setConfig({ ...config, fallbackOnly })}
                        />
                    </label>
                </div>

                {/* Categories */}
                <div className={`space-y-3 ${config.fallbackOnly ? "pointer-events-none opacity-45" : ""}`}>
                    <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/[0.06] pb-2">
                        <div>
                            <h3 className="text-xl font-bold text-white">Categories</h3>
                            <p className="mt-1 text-sm text-zinc-400">
                                Each category chooses <strong className="font-medium text-zinc-300">category</strong>{" "}
                                (one channel) or <strong className="font-medium text-zinc-300">granular</strong>{" "}
                                (optional per-event channels → category → fallback).
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="rounded-md border border-white/[0.08] px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white"
                                onClick={() => setOpenCats(new Set(CATEGORY_META.map(c => c.key)))}
                            >
                                Expand all
                            </button>
                            <button
                                type="button"
                                className="rounded-md border border-white/[0.08] px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white"
                                onClick={() => setOpenCats(new Set())}
                            >
                                Collapse all
                            </button>
                        </div>
                    </div>

                    {CATEGORY_META.map(cat => (
                        <CategorySection
                            key={cat.key}
                            guildId={guildId}
                            cat={cat}
                            config={config}
                            open={openCats.has(cat.key)}
                            onToggleOpen={() => {
                                setOpenCats(prev => {
                                    const next = new Set(prev)
                                    if (next.has(cat.key)) next.delete(cat.key)
                                    else next.add(cat.key)
                                    return next
                                })
                            }}
                            onChange={setConfig}
                        />
                    ))}
                </div>
            </div>

            <SaveBar
                isVisible={!!hasUnsavedChanges || saving}
                isSaving={saving}
                onSave={handleSave}
                onDiscard={() => originalConfig && setConfig(cloneDeep(originalConfig))}
                message="You have unsaved changes in Logging"
            />
        </div>
    )
}
