"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faPlus,
    faTrash,
    faPaperPlane,
    faSpinner,
    faCheck,
    faExclamationTriangle,
    faBullhorn,
    faCode,
    faAlignLeft,
    faPalette,
    faLink,
    faEye,
    faBold,
    faItalic,
    faStrikethrough,
    faHeading,
    faQuoteLeft,
    faListUl,
    faEyeSlash,
} from "@fortawesome/free-solid-svg-icons"
import { EmbedBuilder, defaultEmbed, type EmbedData } from "@/components/dashboard/embed-builder"
import { MessagePreview } from "@/components/dashboard/embed-preview"

interface Webhook {
    name: string
    url: string
    createdAt: string
}

type MessageTab = "normal" | "embed" | "json"

// Formatting toolbar actions
const formatActions = [
    { icon: faBold, label: "Bold", prefix: "**", suffix: "**", placeholder: "bold text" },
    { icon: faItalic, label: "Italic", prefix: "*", suffix: "*", placeholder: "italic text" },
    { icon: faStrikethrough, label: "Strikethrough", prefix: "~~", suffix: "~~", placeholder: "strikethrough" },
    { icon: faCode, label: "Code", prefix: "`", suffix: "`", placeholder: "code" },
    { icon: faHeading, label: "Heading", prefix: "# ", suffix: "", placeholder: "heading" },
    { icon: faQuoteLeft, label: "Quote", prefix: "> ", suffix: "", placeholder: "quote" },
    { icon: faListUl, label: "List", prefix: "- ", suffix: "", placeholder: "list item" },
    { icon: faEyeSlash, label: "Spoiler", prefix: "||", suffix: "||", placeholder: "spoiler" },
]

export default function AnnouncePage() {
    const { data: session } = useSession()
    const params = useParams()
    const guildId = params?.guildId as string

    // Webhook state
    // Webhook state
    const [selectedWebhook, setSelectedWebhook] = useState<string>("")
    const [newWebhookName, setNewWebhookName] = useState("")
    const [newWebhookUrl, setNewWebhookUrl] = useState("")
    const [showAddWebhook, setShowAddWebhook] = useState(false)

    // Message state
    const [activeTab, setActiveTab] = useState<MessageTab>("normal")
    const [normalContent, setNormalContent] = useState("")
    const [embed, setEmbed] = useState<EmbedData>(defaultEmbed)
    const [jsonContent, setJsonContent] = useState("")
    const [jsonError, setJsonError] = useState("")

    // Send state
    const [sending, setSending] = useState(false)
    const [sendResult, setSendResult] = useState<{
        type: "success" | "error"
        message: string
    } | null>(null)

    // Preview toggle for mobile
    const [showMobilePreview, setShowMobilePreview] = useState(false)

    // Textarea ref for formatting toolbar
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const embedDescRef = useRef<HTMLTextAreaElement>(null)

    const { data: webhooks = [], isLoading: webhookLoading, refetch: refetchWebhooks } = useQuery<Webhook[]>({
        queryKey: ["webhooks", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/webhooks`)
            if (!res.ok) throw new Error("Failed to fetch webhooks")
            return res.json()
        },
        enabled: !!session && !!guildId
    })

    useEffect(() => {
        if (webhooks.length > 0 && !selectedWebhook) {
            setSelectedWebhook(webhooks[0].url)
        }
    }, [webhooks, selectedWebhook])

    const addWebhook = async () => {
        if (!newWebhookName || !newWebhookUrl) return

        try {
            const res = await fetch(`/api/guilds/${guildId}/webhooks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newWebhookName, url: newWebhookUrl }),
            })

            if (res.ok) {
                const data = await res.json()
                await refetchWebhooks()
                if (!selectedWebhook && data.length > 0) {
                    setSelectedWebhook(data[data.length - 1].url)
                }
                setNewWebhookName("")
                setNewWebhookUrl("")
                setShowAddWebhook(false)
            } else {
                const err = await res.json()
                setSendResult({ type: "error", message: err.error })
            }
        } catch (error) {
            console.error("Error adding webhook:", error)
        }
    }

    const removeWebhook = async (url: string) => {
        try {
            const res = await fetch(`/api/guilds/${guildId}/webhooks`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            })

            if (res.ok) {
                await refetchWebhooks()
                if (selectedWebhook === url) {
                    setSelectedWebhook("")
                }
            }
        } catch (error) {
            console.error("Error removing webhook:", error)
        }
    }

    // Format insertion helper
    const insertFormat = (prefix: string, suffix: string, placeholder: string) => {
        const textarea = activeTab === "normal" ? textareaRef.current : embedDescRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = textarea.value
        const selected = text.substring(start, end) || placeholder

        const newText = text.substring(0, start) + prefix + selected + suffix + text.substring(end)

        if (activeTab === "normal") {
            setNormalContent(newText)
        } else if (activeTab === "embed") {
            setEmbed({ ...embed, description: newText })
        }

        // Restore cursor after React re-renders
        setTimeout(() => {
            textarea.focus()
            const newCursorPos = start + prefix.length + selected.length
            textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
    }

    // Get webhook name for selected webhook
    const selectedWebhookName =
        webhooks.find((w) => w.url === selectedWebhook)?.name || "Demon Bot"

    const buildPayload = (): Record<string, any> | null => {
        if (activeTab === "normal") {
            if (!normalContent.trim()) return null
            return { content: normalContent }
        }

        if (activeTab === "embed") {
            const embedObj: Record<string, any> = {}
            if (embed.title) embedObj.title = embed.title
            if (embed.description) embedObj.description = embed.description
            if (embed.url) embedObj.url = embed.url
            if (embed.color) embedObj.color = parseInt(embed.color.replace("#", ""), 16)
            if (embed.author.name) {
                embedObj.author = {
                    name: embed.author.name,
                    ...(embed.author.icon_url && { icon_url: embed.author.icon_url }),
                }
            }
            if (embed.thumbnail) embedObj.thumbnail = { url: embed.thumbnail }
            if (embed.image) embedObj.image = { url: embed.image }
            if (embed.footer.text) {
                embedObj.footer = {
                    text: embed.footer.text,
                    ...(embed.footer.icon_url && { icon_url: embed.footer.icon_url }),
                }
            }
            if (embed.fields.length > 0)
                embedObj.fields = embed.fields.filter((f) => f.name || f.value)
            if (embed.timestamp) embedObj.timestamp = new Date().toISOString()

            if (Object.keys(embedObj).length === 0) return null
            return { embeds: [embedObj] }
        }

        if (activeTab === "json") {
            try {
                const parsed = JSON.parse(jsonContent)
                setJsonError("")
                return parsed
            } catch {
                setJsonError("Invalid JSON format")
                return null
            }
        }

        return null
    }

    const sendMessage = async () => {
        if (!selectedWebhook) {
            setSendResult({ type: "error", message: "No webhook selected" })
            return
        }

        const payload = buildPayload()
        if (!payload) {
            setSendResult({ type: "error", message: "Message content is empty" })
            return
        }

        setSending(true)
        setSendResult(null)

        try {
            const res = await fetch(`/api/guilds/${guildId}/webhooks/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ webhookUrl: selectedWebhook, payload }),
            })

            if (res.ok) {
                setSendResult({ type: "success", message: "Message sent successfully!" })
            } else {
                const err = await res.json()
                setSendResult({ type: "error", message: err.error || "Failed to send" })
            }
        } catch (error) {
            setSendResult({ type: "error", message: "Network error" })
        } finally {
            setSending(false)
        }
    }

    // Parse JSON for preview
    const getJsonPreviewEmbed = (): EmbedData | undefined => {
        if (activeTab !== "json" || !jsonContent.trim()) return undefined
        try {
            const parsed = JSON.parse(jsonContent)
            if (parsed.embeds && parsed.embeds[0]) {
                const e = parsed.embeds[0]
                return {
                    title: e.title || "",
                    description: e.description || "",
                    color: e.color ? `#${e.color.toString(16).padStart(6, "0")}` : "#8b5cf6",
                    url: e.url || "",
                    author: { name: e.author?.name || "", icon_url: e.author?.icon_url || "" },
                    thumbnail: e.thumbnail?.url || "",
                    image: e.image?.url || "",
                    footer: { text: e.footer?.text || "", icon_url: e.footer?.icon_url || "" },
                    fields: e.fields || [],
                    timestamp: !!e.timestamp,
                }
            }
        } catch {
            // invalid JSON
        }
        return undefined
    }

    const getPreviewContent = (): string | undefined => {
        if (activeTab === "normal") return normalContent || undefined
        if (activeTab === "json") {
            try {
                const parsed = JSON.parse(jsonContent)
                return parsed.content || undefined
            } catch {
                return undefined
            }
        }
        return undefined
    }

    const getPreviewEmbed = (): EmbedData | undefined => {
        if (activeTab === "embed") return embed
        if (activeTab === "json") return getJsonPreviewEmbed()
        return undefined
    }

    const charCount = activeTab === "normal" ? normalContent.length : 0
    const charLimit = 2000
    const charPercent = Math.min((charCount / charLimit) * 100, 100)

    const tabs: { id: MessageTab; label: string; icon: any }[] = [
        { id: "normal", label: "Normal", icon: faAlignLeft },
        { id: "embed", label: "Embed", icon: faPalette },
        { id: "json", label: "JSON", icon: faCode },
    ]

    const inputClass =
        "w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/30 transition-all"

    const previewPanel = (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Preview
                </span>
            </div>
            <div className="p-2">
                <MessagePreview
                    content={getPreviewContent()}
                    embed={getPreviewEmbed()}
                    botName={selectedWebhookName}
                />
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FontAwesomeIcon icon={faBullhorn} className="w-6 h-6 text-[#8b5cf6]" />
                        Announce
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Send announcements to your server via webhooks
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Mobile preview toggle */}
                    <button
                        onClick={() => setShowMobilePreview(!showMobilePreview)}
                        className="xl:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.06] text-gray-300 text-sm font-medium hover:bg-white/[0.1] hover:text-white transition-all"
                    >
                        <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                        Preview
                    </button>
                    <button
                        onClick={sendMessage}
                        disabled={sending || !selectedWebhook}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#8b5cf6] text-white text-sm font-semibold hover:bg-[#7c3aed] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#8b5cf6]/20"
                    >
                        {sending ? (
                            <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                        ) : (
                            <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                        )}
                        Send
                    </button>
                </div>
            </div>

            {/* Status bar */}
            <AnimatePresence mode="wait">
                {sendResult && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm ${sendResult.type === "success"
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "bg-red-500/10 border border-red-500/20 text-red-400"
                            }`}
                    >
                        <FontAwesomeIcon
                            icon={sendResult.type === "success" ? faCheck : faExclamationTriangle}
                            className="w-3.5 h-3.5"
                        />
                        {sendResult.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile preview panel */}
            <AnimatePresence>
                {showMobilePreview && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="xl:hidden overflow-hidden"
                    >
                        {previewPanel}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main split layout */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
                {/* Left: Editor */}
                <div className="space-y-5">
                    {/* Webhook selector */}
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <FontAwesomeIcon icon={faLink} className="w-3.5 h-3.5 text-gray-400" />
                                Webhook
                            </h3>
                            <button
                                onClick={() => setShowAddWebhook(!showAddWebhook)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#8b5cf6]/10 text-[#a78bfa] text-xs font-medium hover:bg-[#8b5cf6]/20 transition-colors"
                            >
                                <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
                                Add
                            </button>
                        </div>

                        {/* Add webhook form */}
                        <AnimatePresence>
                            {showAddWebhook && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mb-3"
                                >
                                    <div className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] space-y-2">
                                        <input
                                            className={inputClass}
                                            placeholder="Webhook name (e.g. Announcements)"
                                            value={newWebhookName}
                                            onChange={(e) => setNewWebhookName(e.target.value)}
                                        />
                                        <input
                                            className={inputClass}
                                            placeholder="https://discord.com/api/webhooks/..."
                                            value={newWebhookUrl}
                                            onChange={(e) => setNewWebhookUrl(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={addWebhook}
                                                disabled={!newWebhookName || !newWebhookUrl}
                                                className="px-3 py-1.5 rounded-md bg-[#8b5cf6] text-white text-xs font-medium hover:bg-[#7c3aed] transition-colors disabled:opacity-40"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setShowAddWebhook(false)}
                                                className="px-3 py-1.5 rounded-md bg-white/[0.06] text-gray-400 text-xs hover:text-white transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Webhook list */}
                        {webhookLoading ? (
                            <div className="text-center py-4 text-gray-500 text-xs">
                                <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin mr-1" />
                                Loading...
                            </div>
                        ) : webhooks.length === 0 ? (
                            <p className="text-center py-4 text-gray-500 text-xs">
                                No webhooks yet. Add one to get started.
                            </p>
                        ) : (
                            <div className="space-y-1.5">
                                {webhooks.map((wh) => (
                                    <div
                                        key={wh.url}
                                        onClick={() => setSelectedWebhook(wh.url)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-all ${selectedWebhook === wh.url
                                            ? "border-[#8b5cf6]/30 bg-[#8b5cf6]/5"
                                            : "border-white/[0.04] hover:bg-white/[0.03]"
                                            }`}
                                    >
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-white truncate">{wh.name}</p>
                                            <p className="text-[10px] text-gray-500 truncate font-mono">
                                                {wh.url.slice(0, 50)}...
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                removeWebhook(wh.url)
                                            }}
                                            className="text-gray-600 hover:text-red-400 transition-colors ml-2 flex-shrink-0"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Message tabs */}
                    <div className="flex gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center ${activeTab === tab.id
                                    ? "bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                                    }`}
                            >
                                <FontAwesomeIcon icon={tab.icon} className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                        {/* Formatting toolbar for Normal and Embed Description */}
                        {(activeTab === "normal" || activeTab === "embed") && (
                            <div className="flex items-center gap-0.5 px-3 py-2 border-b border-white/[0.06] bg-white/[0.01] flex-wrap">
                                {formatActions.map((action) => (
                                    <button
                                        key={action.label}
                                        onClick={() => insertFormat(action.prefix, action.suffix, action.placeholder)}
                                        title={action.label}
                                        className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                                    >
                                        <FontAwesomeIcon icon={action.icon} className="w-3.5 h-3.5" />
                                    </button>
                                ))}
                                <div className="flex-1" />
                                <span className="text-[10px] text-gray-600 hidden sm:block">
                                    Discord Markdown
                                </span>
                            </div>
                        )}

                        <div className="p-4">
                            {activeTab === "normal" && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                        Message Content
                                    </label>
                                    <textarea
                                        ref={textareaRef}
                                        className={`${inputClass} min-h-[200px] resize-y`}
                                        placeholder="Type your announcement message here...&#10;&#10;Supports Discord markdown:&#10;**bold** *italic* ~~strikethrough~~&#10;# Heading 1  ## Heading 2  ### Heading 3&#10;`inline code` ```code block```&#10;> blockquote  ||spoiler||"
                                        value={normalContent}
                                        onChange={(e) => setNormalContent(e.target.value)}
                                    />
                                    <div className="flex items-center justify-between mt-1.5">
                                        <p className="text-[11px] text-gray-600">
                                            Supports Discord markdown formatting
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${charPercent > 90
                                                        ? "bg-red-500"
                                                        : charPercent > 70
                                                            ? "bg-yellow-500"
                                                            : "bg-[#8b5cf6]"
                                                        }`}
                                                    style={{ width: `${charPercent}%` }}
                                                />
                                            </div>
                                            <p className={`text-[11px] ${charCount > 1900 ? "text-red-400" : "text-gray-500"}`}>
                                                {charCount}/{charLimit}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "embed" && <EmbedBuilder embed={embed} onChange={setEmbed} />}

                            {activeTab === "json" && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                        Raw JSON Payload
                                    </label>
                                    <textarea
                                        className={`${inputClass} min-h-[280px] resize-y font-mono text-xs`}
                                        placeholder={`{\n  "content": "Hello!",\n  "embeds": [\n    {\n      "title": "My Embed",\n      "description": "Description here",\n      "color": 9146622\n    }\n  ]\n}`}
                                        value={jsonContent}
                                        onChange={(e) => {
                                            setJsonContent(e.target.value)
                                            setJsonError("")
                                        }}
                                    />
                                    {jsonError && (
                                        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="w-3 h-3" />
                                            {jsonError}
                                        </p>
                                    )}
                                    <p className="text-[11px] text-gray-500 mt-1.5">
                                        Paste a valid Discord webhook JSON payload.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Discord-style Preview (sticky, desktop) */}
                <div className="hidden xl:block">
                    <div className="sticky top-6">
                        {previewPanel}
                    </div>
                </div>
            </div>
        </div>
    )
}
