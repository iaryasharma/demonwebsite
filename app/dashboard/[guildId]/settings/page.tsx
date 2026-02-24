"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faFloppyDisk,
    faRotateLeft,
    faSpinner,
    faCheck,
    faTerminal,
    faHashtag,
    faLock,
    faLockOpen,
    faClock,
    faWrench,
    faToggleOn,
    faToggleOff,
    faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons"

interface GuildData {
    guildId: string
    prefix: string
    settings: Record<string, any>
}

interface Channel {
    id: string
    name: string
    position: number
    parentId: string | null
}

function ToggleSwitch({
    enabled,
    onChange,
    disabled,
}: {
    enabled: boolean
    onChange: (v: boolean) => void
    disabled?: boolean
}) {
    return (
        <button
            onClick={() => !disabled && onChange(!enabled)}
            disabled={disabled}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${disabled ? "opacity-50 cursor-not-allowed" : ""
                } ${enabled ? "bg-[#8b5cf6]" : "bg-white/[0.08]"}`}
        >
            <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? "translate-x-5" : ""
                    }`}
            />
        </button>
    )
}

function StatusBadge({ text, color }: { text: string; color: string }) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${color}`}>
            {text}
        </span>
    )
}

export default function SettingsPage() {
    const { data: session, status } = useSession()
    const params = useParams()
    const router = useRouter()
    const guildId = params?.guildId as string

    // Prefix state
    const [data, setData] = useState<GuildData | null>(null)
    const [original, setOriginal] = useState<GuildData | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Channel management state
    const [channels, setChannels] = useState<Channel[]>([])
    const [channelsLoading, setChannelsLoading] = useState(true)
    const [disabledChannels, setDisabledChannels] = useState<string[]>([])
    const [togglingChannel, setTogglingChannel] = useState<string | null>(null)

    // Channel actions state
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [slowmodeInputs, setSlowmodeInputs] = useState<Record<string, string>>({})
    const [actionFeedback, setActionFeedback] = useState<{ channelId: string; message: string; type: "success" | "error" } | null>(null)

    // Maintenance state
    const [mmodeActive, setMmodeActive] = useState(false)
    const [mmodeLoading, setMmodeLoading] = useState(true)
    const [mmodeActionLoading, setMmodeActionLoading] = useState(false)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/dashboard")
            return
        }
        if (status !== "authenticated") return

        async function fetchAll() {
            try {
                const [settingsRes, channelsRes, disabledRes, mmodeRes] = await Promise.all([
                    fetch(`/api/guilds/${guildId}/settings`),
                    fetch(`/api/guilds/${guildId}/channels`),
                    fetch(`/api/guilds/${guildId}/settings/disabled-channels`),
                    fetch(`/api/guilds/${guildId}/maintenance`),
                ])

                if (settingsRes.ok) {
                    const json = await settingsRes.json()
                    setData(json)
                    setOriginal(JSON.parse(JSON.stringify(json)))
                }
                if (channelsRes.ok) {
                    setChannels(await channelsRes.json())
                }
                if (disabledRes.ok) {
                    const d = await disabledRes.json()
                    setDisabledChannels(d.disabledChannels || [])
                }
                if (mmodeRes.ok) {
                    const m = await mmodeRes.json()
                    setMmodeActive(m.active)
                }
            } catch {
            } finally {
                setLoading(false)
                setChannelsLoading(false)
                setMmodeLoading(false)
            }
        }
        fetchAll()
    }, [guildId, status, router])

    const hasChanges = JSON.stringify(data) !== JSON.stringify(original)

    const handleSave = async () => {
        if (!data) return
        setSaving(true)
        try {
            const res = await fetch(`/api/guilds/${guildId}/settings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prefix: data.prefix, settings: data.settings }),
            })
            if (res.ok) {
                const updated = await res.json()
                setData(updated)
                setOriginal(JSON.parse(JSON.stringify(updated)))
                setSaved(true)
                setTimeout(() => setSaved(false), 2000)
            }
        } catch {
        } finally {
            setSaving(false)
        }
    }

    const handleDiscard = () => {
        if (original) {
            setData(JSON.parse(JSON.stringify(original)))
        }
    }

    // Toggle command enable/disable for a channel
    const toggleChannelCommands = useCallback(async (channelId: string) => {
        setTogglingChannel(channelId)
        const isCurrentlyDisabled = disabledChannels.includes(channelId)
        const action = isCurrentlyDisabled ? "enable" : "disable"

        try {
            const res = await fetch(`/api/guilds/${guildId}/settings/disabled-channels`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ channelId, action }),
            })
            if (res.ok) {
                const result = await res.json()
                setDisabledChannels(result.disabledChannels)
            }
        } catch {
        } finally {
            setTogglingChannel(null)
        }
    }, [guildId, disabledChannels])

    // Lock/unlock/slowmode a channel
    const handleChannelAction = useCallback(async (channelId: string, action: string, duration?: string) => {
        setActionLoading(`${channelId}-${action}`)
        setActionFeedback(null)

        try {
            const res = await fetch(`/api/guilds/${guildId}/channels/manage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ channelId, action, duration }),
            })

            if (res.ok) {
                const channelName = channels.find(c => c.id === channelId)?.name || "channel"
                let msg = ""
                if (action === "lock") msg = `#${channelName} locked`
                else if (action === "unlock") msg = `#${channelName} unlocked`
                else if (action === "slowmode") msg = `Slowmode ${duration === "0" ? "disabled" : `set to ${duration}s`} in #${channelName}`
                setActionFeedback({ channelId, message: msg, type: "success" })
            } else {
                const err = await res.json().catch(() => ({}))
                setActionFeedback({ channelId, message: err.error || "Action failed", type: "error" })
            }
        } catch {
            setActionFeedback({ channelId, message: "Network error", type: "error" })
        } finally {
            setActionLoading(null)
            setTimeout(() => setActionFeedback(null), 3000)
        }
    }, [guildId, channels])

    // Maintenance mode toggle
    const toggleMmode = useCallback(async () => {
        setMmodeActionLoading(true)
        const action = mmodeActive ? "stop" : "start"

        try {
            const res = await fetch(`/api/guilds/${guildId}/maintenance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            })
            if (res.ok) {
                setMmodeActive(!mmodeActive)
            }
        } catch {
        } finally {
            setMmodeActionLoading(false)
        }
    }, [guildId, mmodeActive])

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-[#8b5cf6] animate-spin" />
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between mb-10"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                        <p className="text-gray-500 text-sm">Configure Demon Bot for this server</p>
                    </div>

                    {/* Save/Discard */}
                    {hasChanges && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3"
                        >
                            <button
                                onClick={handleDiscard}
                                className="px-4 py-2 rounded-lg border border-white/[0.08] text-gray-400 text-sm hover:text-white hover:bg-white/[0.04] transition-all"
                            >
                                <FontAwesomeIcon icon={faRotateLeft} className="w-3.5 h-3.5 mr-2" />
                                Discard
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#8b5cf6]/20 transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 mr-2 animate-spin" />
                                ) : saved ? (
                                    <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 mr-2" />
                                ) : (
                                    <FontAwesomeIcon icon={faFloppyDisk} className="w-3.5 h-3.5 mr-2" />
                                )}
                                {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
                            </button>
                        </motion.div>
                    )}
                </motion.div>

                {/* Settings sections */}
                <div className="space-y-8">
                    {/* ── General ── */}
                    <motion.section
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="glass rounded-xl border border-white/[0.06] overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-3">
                            <FontAwesomeIcon icon={faTerminal} className="w-4 h-4 text-[#a78bfa]" />
                            <h2 className="text-white font-semibold">General</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Bot Prefix</label>
                                <input
                                    type="text"
                                    value={data.prefix}
                                    onChange={(e) => setData({ ...data, prefix: e.target.value })}
                                    maxLength={5}
                                    className="w-full max-w-xs px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.06] focus:border-[#8b5cf6]/30 focus:ring-2 focus:ring-[#8b5cf6]/10 focus:outline-none text-white font-mono text-sm transition-all"
                                />
                                <p className="text-xs text-gray-600 mt-1.5">Maximum 5 characters</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* ── Command Channels (Enable/Disable) ── */}
                    <motion.section
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass rounded-xl border border-white/[0.06] overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-3">
                            <FontAwesomeIcon icon={faHashtag} className="w-4 h-4 text-blue-400" />
                            <h2 className="text-white font-semibold">Command Channels</h2>
                            <span className="text-xs text-gray-500 ml-auto">
                                {disabledChannels.length} channel{disabledChannels.length !== 1 ? "s" : ""} disabled
                            </span>
                        </div>
                        <div className="p-6">
                            <p className="text-xs text-gray-500 mb-4">
                                Toggle which channels the bot responds to commands in. Disabled channels will ignore all bot commands.
                            </p>
                            {channelsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 text-[#8b5cf6] animate-spin" />
                                </div>
                            ) : channels.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">No channels found</p>
                            ) : (
                                <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                                    {channels.map((ch) => {
                                        const isDisabled = disabledChannels.includes(ch.id)
                                        const isToggling = togglingChannel === ch.id
                                        return (
                                            <div
                                                key={ch.id}
                                                className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${isDisabled
                                                        ? "bg-red-500/[0.06] border border-red-500/10"
                                                        : "hover:bg-white/[0.03]"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className="text-gray-500 text-xs shrink-0">#</span>
                                                    <span className={`text-sm truncate ${isDisabled ? "text-gray-500 line-through" : "text-gray-200"}`}>
                                                        {ch.name}
                                                    </span>
                                                    {isDisabled && (
                                                        <StatusBadge text="disabled" color="bg-red-500/15 text-red-400" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                                    {isToggling && (
                                                        <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 text-gray-400 animate-spin" />
                                                    )}
                                                    <ToggleSwitch
                                                        enabled={!isDisabled}
                                                        onChange={() => toggleChannelCommands(ch.id)}
                                                        disabled={isToggling}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {/* ── Channel Management (Lock/Unlock + Slowmode) ── */}
                    <motion.section
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass rounded-xl border border-white/[0.06] overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-3">
                            <FontAwesomeIcon icon={faLock} className="w-4 h-4 text-yellow-400" />
                            <h2 className="text-white font-semibold">Channel Management</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-xs text-gray-500 mb-4">
                                Lock or unlock channels and set slowmode. These actions take effect immediately on Discord.
                            </p>

                            {/* Feedback toast */}
                            <AnimatePresence>
                                {actionFeedback && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`mb-4 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 ${actionFeedback.type === "success"
                                                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                                                : "bg-red-500/10 border border-red-500/20 text-red-400"
                                            }`}
                                    >
                                        <FontAwesomeIcon
                                            icon={actionFeedback.type === "success" ? faCheck : faCircleExclamation}
                                            className="w-3.5 h-3.5"
                                        />
                                        {actionFeedback.message}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {channelsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 text-[#8b5cf6] animate-spin" />
                                </div>
                            ) : channels.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">No channels found</p>
                            ) : (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                    {channels.map((ch) => {
                                        const isLocking = actionLoading === `${ch.id}-lock`
                                        const isUnlocking = actionLoading === `${ch.id}-unlock`
                                        const isSettingSlowmode = actionLoading === `${ch.id}-slowmode`
                                        const slowmodeValue = slowmodeInputs[ch.id] ?? ""

                                        return (
                                            <div
                                                key={ch.id}
                                                className="px-4 py-3 rounded-lg hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/[0.04]"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-500 text-xs">#</span>
                                                        <span className="text-sm text-gray-200">{ch.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleChannelAction(ch.id, "lock")}
                                                            disabled={!!actionLoading}
                                                            className="px-3 py-1 text-xs rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/15 transition-all disabled:opacity-40"
                                                        >
                                                            {isLocking ? (
                                                                <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <FontAwesomeIcon icon={faLock} className="w-3 h-3 mr-1" />
                                                                    Lock
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleChannelAction(ch.id, "unlock")}
                                                            disabled={!!actionLoading}
                                                            className="px-3 py-1 text-xs rounded-md bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/15 transition-all disabled:opacity-40"
                                                        >
                                                            {isUnlocking ? (
                                                                <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <FontAwesomeIcon icon={faLockOpen} className="w-3 h-3 mr-1" />
                                                                    Unlock
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Slowmode row */}
                                                <div className="flex items-center gap-2 ml-5">
                                                    <FontAwesomeIcon icon={faClock} className="w-3 h-3 text-gray-600" />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="21600"
                                                        placeholder="0"
                                                        value={slowmodeValue}
                                                        onChange={(e) =>
                                                            setSlowmodeInputs((prev) => ({
                                                                ...prev,
                                                                [ch.id]: e.target.value,
                                                            }))
                                                        }
                                                        className="w-20 px-2.5 py-1 text-xs rounded-md bg-black/40 border border-white/[0.06] text-white focus:border-[#8b5cf6]/30 focus:outline-none"
                                                    />
                                                    <span className="text-[10px] text-gray-600">seconds</span>
                                                    <button
                                                        onClick={() => handleChannelAction(ch.id, "slowmode", slowmodeValue || "0")}
                                                        disabled={!!actionLoading}
                                                        className="px-2.5 py-1 text-xs rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/15 transition-all disabled:opacity-40"
                                                    >
                                                        {isSettingSlowmode ? (
                                                            <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            "Set"
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {/* ── Maintenance Mode ── */}
                    <motion.section
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-xl border border-white/[0.06] overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-3">
                            <FontAwesomeIcon icon={faWrench} className="w-4 h-4 text-orange-400" />
                            <h2 className="text-white font-semibold">Maintenance Mode</h2>
                            {!mmodeLoading && (
                                <StatusBadge
                                    text={mmodeActive ? "active" : "inactive"}
                                    color={
                                        mmodeActive
                                            ? "bg-orange-500/15 text-orange-400"
                                            : "bg-gray-500/15 text-gray-500"
                                    }
                                />
                            )}
                        </div>
                        <div className="p-6">
                            <p className="text-xs text-gray-500 mb-5">
                                Maintenance mode locks all channels and creates temporary maintenance channels for communication.
                                This is a server-wide action.
                            </p>

                            {mmodeLoading ? (
                                <div className="flex items-center justify-center py-6">
                                    <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 text-[#8b5cf6] animate-spin" />
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className={`flex-1 p-4 rounded-lg border ${mmodeActive
                                            ? "bg-orange-500/[0.06] border-orange-500/15"
                                            : "bg-white/[0.02] border-white/[0.04]"
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2.5 h-2.5 rounded-full ${mmodeActive ? "bg-orange-400 animate-pulse" : "bg-gray-600"
                                                }`} />
                                            <span className="text-sm text-gray-300">
                                                {mmodeActive
                                                    ? "Server is in maintenance mode — all channels are locked"
                                                    : "Server is operating normally"}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleMmode}
                                        disabled={mmodeActionLoading}
                                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 shrink-0 ${mmodeActive
                                                ? "bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/20"
                                                : "bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 border border-orange-500/20"
                                            }`}
                                    >
                                        {mmodeActionLoading ? (
                                            <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                                        ) : mmodeActive ? (
                                            <>
                                                <FontAwesomeIcon icon={faLockOpen} className="w-3.5 h-3.5 mr-2" />
                                                End Maintenance
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faWrench} className="w-3.5 h-3.5 mr-2" />
                                                Start Maintenance
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.section>
                </div>

                {/* Bottom save bar (sticky) */}
                {hasChanges && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-0 left-0 right-0 lg:left-64 z-30 p-4 bg-gray-950/95 backdrop-blur-xl border-t border-white/[0.06]"
                    >
                        <div className="max-w-3xl mx-auto flex items-center justify-between">
                            <p className="text-sm text-yellow-400/80">You have unsaved changes</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDiscard}
                                    className="px-4 py-2 rounded-lg border border-white/[0.08] text-gray-400 text-sm hover:text-white transition-all"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#8b5cf6]/20 transition-all disabled:opacity-50"
                                >
                                    {saving ? "Saving…" : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
