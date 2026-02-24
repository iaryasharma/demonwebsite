"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faFloppyDisk,
    faRotateLeft,
    faSpinner,
    faCheck,
    faTerminal,
    faShieldHalved,
    faDoorOpen,
    faChartLine,
    faToggleOn,
    faToggleOff,
} from "@fortawesome/free-solid-svg-icons"

interface GuildData {
    guildId: string
    prefix: string
    settings: Record<string, any>
}

function ToggleSwitch({
    enabled,
    onChange,
}: {
    enabled: boolean
    onChange: (v: boolean) => void
}) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? "bg-[#8b5cf6]" : "bg-white/[0.08]"
                }`}
        >
            <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? "translate-x-5" : ""
                    }`}
            />
        </button>
    )
}

export default function SettingsPage() {
    const { data: session, status } = useSession()
    const params = useParams()
    const router = useRouter()
    const guildId = params?.guildId as string

    const [data, setData] = useState<GuildData | null>(null)
    const [original, setOriginal] = useState<GuildData | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/dashboard")
            return
        }
        if (status !== "authenticated") return

        async function fetchSettings() {
            try {
                const res = await fetch(`/api/guilds/${guildId}/settings`)
                if (res.ok) {
                    const json = await res.json()
                    setData(json)
                    setOriginal(JSON.parse(JSON.stringify(json)))
                }
            } catch {
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
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

    const updateSetting = (path: string, value: any) => {
        if (!data) return
        const updated = { ...data, settings: { ...data.settings } }
        const parts = path.split(".")
        let obj: any = updated.settings

        for (let i = 0; i < parts.length - 1; i++) {
            if (!obj[parts[i]]) obj[parts[i]] = {}
            obj[parts[i]] = { ...obj[parts[i]] }
            obj = obj[parts[i]]
        }
        obj[parts[parts.length - 1]] = value
        setData(updated)
    }

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-[#8b5cf6] animate-spin" />
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="min-h-screen bg-black p-6 lg:p-10">
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

                    {/* ── Welcome Messages ── */}
                    <motion.section
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass rounded-xl border border-white/[0.06] overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faDoorOpen} className="w-4 h-4 text-green-400" />
                                <h2 className="text-white font-semibold">Welcome Messages</h2>
                            </div>
                            <ToggleSwitch
                                enabled={data.settings?.welcome?.enabled ?? false}
                                onChange={(v) => updateSetting("welcome.enabled", v)}
                            />
                        </div>
                        {data.settings?.welcome?.enabled && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="p-6 space-y-5"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Channel ID</label>
                                    <input
                                        type="text"
                                        value={data.settings?.welcome?.channelId || ""}
                                        onChange={(e) => updateSetting("welcome.channelId", e.target.value)}
                                        placeholder="Enter channel ID"
                                        className="w-full max-w-md px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.06] focus:border-[#8b5cf6]/30 focus:ring-2 focus:ring-[#8b5cf6]/10 focus:outline-none text-white font-mono text-sm transition-all placeholder-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Welcome Message</label>
                                    <textarea
                                        value={data.settings?.welcome?.message || ""}
                                        onChange={(e) => updateSetting("welcome.message", e.target.value)}
                                        placeholder="Welcome to the server, {user}!"
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.06] focus:border-[#8b5cf6]/30 focus:ring-2 focus:ring-[#8b5cf6]/10 focus:outline-none text-white text-sm transition-all placeholder-gray-600 resize-none"
                                    />
                                    <p className="text-xs text-gray-600 mt-1.5">
                                        Use {"{user}"} for mention, {"{server}"} for server name, {"{count}"} for member count
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </motion.section>

                    {/* ── Leave Messages ── */}
                    <motion.section
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass rounded-xl border border-white/[0.06] overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faDoorOpen} className="w-4 h-4 text-red-400" />
                                <h2 className="text-white font-semibold">Leave Messages</h2>
                            </div>
                            <ToggleSwitch
                                enabled={data.settings?.leave?.enabled ?? false}
                                onChange={(v) => updateSetting("leave.enabled", v)}
                            />
                        </div>
                        {data.settings?.leave?.enabled && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="p-6 space-y-5"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Channel ID</label>
                                    <input
                                        type="text"
                                        value={data.settings?.leave?.channelId || ""}
                                        onChange={(e) => updateSetting("leave.channelId", e.target.value)}
                                        placeholder="Enter channel ID"
                                        className="w-full max-w-md px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.06] focus:border-[#8b5cf6]/30 focus:ring-2 focus:ring-[#8b5cf6]/10 focus:outline-none text-white font-mono text-sm transition-all placeholder-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Leave Message</label>
                                    <textarea
                                        value={data.settings?.leave?.message || ""}
                                        onChange={(e) => updateSetting("leave.message", e.target.value)}
                                        placeholder="{user} has left the server."
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.06] focus:border-[#8b5cf6]/30 focus:ring-2 focus:ring-[#8b5cf6]/10 focus:outline-none text-white text-sm transition-all placeholder-gray-600 resize-none"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </motion.section>

                    {/* ── Moderation ── */}
                    <motion.section
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-xl border border-white/[0.06] overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4 text-blue-400" />
                                <h2 className="text-white font-semibold">Moderation</h2>
                            </div>
                            <ToggleSwitch
                                enabled={data.settings?.moderation?.enabled ?? false}
                                onChange={(v) => updateSetting("moderation.enabled", v)}
                            />
                        </div>
                        {data.settings?.moderation?.enabled && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="p-6 space-y-5"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Log Channel ID</label>
                                    <input
                                        type="text"
                                        value={data.settings?.moderation?.logChannelId || ""}
                                        onChange={(e) => updateSetting("moderation.logChannelId", e.target.value)}
                                        placeholder="Enter mod log channel ID"
                                        className="w-full max-w-md px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.06] focus:border-[#8b5cf6]/30 focus:ring-2 focus:ring-[#8b5cf6]/10 focus:outline-none text-white font-mono text-sm transition-all placeholder-gray-600"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-white">AutoMod</p>
                                            <p className="text-xs text-gray-500">Automatically moderate messages</p>
                                        </div>
                                        <ToggleSwitch
                                            enabled={data.settings?.moderation?.automod ?? false}
                                            onChange={(v) => updateSetting("moderation.automod", v)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-white">Anti-Spam</p>
                                            <p className="text-xs text-gray-500">Detect and prevent spam messages</p>
                                        </div>
                                        <ToggleSwitch
                                            enabled={data.settings?.moderation?.antiSpam ?? false}
                                            onChange={(v) => updateSetting("moderation.antiSpam", v)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-white">Anti-Links</p>
                                            <p className="text-xs text-gray-500">Block unauthorized link posting</p>
                                        </div>
                                        <ToggleSwitch
                                            enabled={data.settings?.moderation?.antiLinks ?? false}
                                            onChange={(v) => updateSetting("moderation.antiLinks", v)}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.section>

                    {/* ── Leveling ── */}
                    <motion.section
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="glass rounded-xl border border-white/[0.06] overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-yellow-400" />
                                <h2 className="text-white font-semibold">Leveling System</h2>
                            </div>
                            <ToggleSwitch
                                enabled={data.settings?.leveling?.enabled ?? false}
                                onChange={(v) => updateSetting("leveling.enabled", v)}
                            />
                        </div>
                        {data.settings?.leveling?.enabled && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="p-6 space-y-5"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Level-Up Channel ID</label>
                                    <input
                                        type="text"
                                        value={data.settings?.leveling?.channelId || ""}
                                        onChange={(e) => updateSetting("leveling.channelId", e.target.value)}
                                        placeholder="Enter channel ID (leave empty for current channel)"
                                        className="w-full max-w-md px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.06] focus:border-[#8b5cf6]/30 focus:ring-2 focus:ring-[#8b5cf6]/10 focus:outline-none text-white font-mono text-sm transition-all placeholder-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Level-Up Message</label>
                                    <textarea
                                        value={data.settings?.leveling?.message || ""}
                                        onChange={(e) => updateSetting("leveling.message", e.target.value)}
                                        placeholder="Congrats {user}, you reached level {level}! 🎉"
                                        rows={2}
                                        className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.06] focus:border-[#8b5cf6]/30 focus:ring-2 focus:ring-[#8b5cf6]/10 focus:outline-none text-white text-sm transition-all placeholder-gray-600 resize-none"
                                    />
                                    <p className="text-xs text-gray-600 mt-1.5">
                                        Use {"{user}"} for mention, {"{level}"} for new level
                                    </p>
                                </div>
                            </motion.div>
                        )}
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
