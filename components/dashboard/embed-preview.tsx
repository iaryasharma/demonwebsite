"use client"

import type { EmbedData } from "./embed-builder"
import { DiscordMarkdown } from "./discord-markdown"

interface MessagePreviewProps {
    content?: string
    embed?: EmbedData
    botName?: string
    botAvatar?: string
}

export function MessagePreview({
    content,
    embed,
    botName = "Demon Bot",
    botAvatar,
}: MessagePreviewProps) {
    const hasEmbed =
        embed &&
        (embed.title ||
            embed.description ||
            embed.author.name ||
            embed.footer.text ||
            embed.fields.length > 0 ||
            embed.image ||
            embed.thumbnail)

    const hasContent = content?.trim()

    if (!hasContent && !hasEmbed) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-500">
                <svg className="w-12 h-12 mb-3 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                </svg>
                <p className="text-sm font-medium">Message Preview</p>
                <p className="text-xs text-gray-600 mt-1">Start typing to see a preview</p>
            </div>
        )
    }

    const now = new Date()
    const timeStr = `Today at ${now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    })}`

    return (
        <div style={{ background: "#313338", borderRadius: "8px", overflow: "hidden" }}>
            {/* Message */}
            <div style={{ padding: "12px 16px" }} className="hover:bg-[#2e3035] transition-colors group">
                <div style={{ display: "flex", gap: "16px" }}>
                    {/* Avatar */}
                    <div style={{ flexShrink: 0, marginTop: "2px" }}>
                        {botAvatar ? (
                            <img
                                src={botAvatar}
                                alt={botName}
                                style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    background: "#5865F2",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <svg style={{ width: 20, height: 20, color: "white" }} viewBox="0 0 28 20" fill="currentColor">
                                    <path d="M23.02 1.55A21.8 21.8 0 0017.6.04a.08.08 0 00-.09.04c-.23.42-.5.97-.68 1.4a20.46 20.46 0 00-6.07 0A14.48 14.48 0 0010.07.08a.08.08 0 00-.09-.04A21.74 21.74 0 004.57 1.55a.07.07 0 00-.03.03C.67 7.03-.4 12.36.13 17.63a.09.09 0 00.03.06 21.99 21.99 0 006.6 3.32.08.08 0 00.09-.03 15.7 15.7 0 001.36-2.2.08.08 0 00-.04-.11 14.5 14.5 0 01-2.07-.98.08.08 0 01-.01-.13c.14-.1.28-.21.41-.32a.08.08 0 01.08-.01c4.34 1.98 9.04 1.98 13.33 0a.08.08 0 01.08.01c.13.11.27.22.41.32a.08.08 0 01-.01.13c-.66.39-1.35.71-2.07.98a.08.08 0 00-.04.11c.4.76.85 1.5 1.36 2.2a.08.08 0 00.09.03 21.95 21.95 0 006.6-3.32.09.09 0 00.04-.06c.63-6.52-.06-12.18-4.5-17.2a.07.07 0 00-.04-.03zM9.34 14.42c-1.49 0-2.72-1.37-2.72-3.05 0-1.69 1.2-3.05 2.72-3.05 1.53 0 2.75 1.38 2.72 3.05 0 1.68-1.2 3.05-2.72 3.05zm10.03 0c-1.49 0-2.72-1.37-2.72-3.05 0-1.69 1.2-3.05 2.72-3.05 1.53 0 2.75 1.38 2.72 3.05 0 1.68-1.2 3.05-2.72 3.05z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                        {/* Username + timestamp */}
                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ color: "#f2f3f5", fontWeight: 500, fontSize: "0.875rem", lineHeight: 1.2, cursor: "pointer" }}>
                                {botName}
                            </span>
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    padding: "0 4px 1px",
                                    borderRadius: "3px",
                                    fontSize: "10px",
                                    fontWeight: 500,
                                    background: "#5865F2",
                                    color: "white",
                                    lineHeight: "15px",
                                    verticalAlign: "baseline",
                                }}
                            >
                                BOT
                            </span>
                            <span style={{ color: "#949ba4", fontSize: "0.75rem" }}>{timeStr}</span>
                        </div>

                        {/* Text content with markdown */}
                        {hasContent && (
                            <DiscordMarkdown
                                text={content!}
                                className="text-[#dbdee1] text-sm leading-relaxed break-words"
                            />
                        )}

                        {/* Embed */}
                        {hasEmbed && embed && (
                            <div style={{ marginTop: "8px", maxWidth: "520px" }}>
                                <div
                                    style={{
                                        borderRadius: "4px",
                                        overflow: "hidden",
                                        background: "#2b2d31",
                                        border: "1px solid #232428",
                                        display: "flex",
                                    }}
                                >
                                    {/* Color bar */}
                                    <div
                                        style={{
                                            width: "4px",
                                            flexShrink: 0,
                                            backgroundColor: embed.color || "#8b5cf6",
                                        }}
                                    />

                                    <div style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {/* Author */}
                                        {embed.author.name && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                {embed.author.icon_url && (
                                                    <img
                                                        src={embed.author.icon_url}
                                                        alt=""
                                                        style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = "none"
                                                        }}
                                                    />
                                                )}
                                                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#f2f3f5" }}>
                                                    {embed.author.name}
                                                </span>
                                            </div>
                                        )}

                                        <div style={{ display: "flex", gap: "16px" }}>
                                            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                                                {/* Title */}
                                                {embed.title && (
                                                    <div>
                                                        {embed.url ? (
                                                            <a
                                                                href={embed.url}
                                                                style={{ color: "#00a8fc", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                {embed.title}
                                                            </a>
                                                        ) : (
                                                            <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#f2f3f5", margin: 0 }}>
                                                                {embed.title}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Description with markdown */}
                                                {embed.description && (
                                                    <DiscordMarkdown
                                                        text={embed.description}
                                                        className="text-[#dbdee1] text-[13px] leading-snug break-words"
                                                    />
                                                )}

                                                {/* Fields */}
                                                {embed.fields.length > 0 && (
                                                    <div
                                                        style={{
                                                            display: "grid",
                                                            gridTemplateColumns: "repeat(3, 1fr)",
                                                            gap: "8px",
                                                            marginTop: "4px",
                                                        }}
                                                    >
                                                        {embed.fields.map((field, idx) => (
                                                            <div
                                                                key={idx}
                                                                style={{ gridColumn: field.inline ? undefined : "span 3" }}
                                                            >
                                                                {field.name && (
                                                                    <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#f2f3f5", marginBottom: "2px", margin: 0 }}>
                                                                        {field.name}
                                                                    </p>
                                                                )}
                                                                {field.value && (
                                                                    <DiscordMarkdown
                                                                        text={field.value}
                                                                        className="text-xs text-[#dbdee1] break-words"
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Image */}
                                                {embed.image && (
                                                    <div style={{ marginTop: "8px" }}>
                                                        <img
                                                            src={embed.image}
                                                            alt=""
                                                            style={{ maxWidth: "100%", borderRadius: "4px", maxHeight: "300px", objectFit: "contain" }}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = "none"
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Thumbnail */}
                                            {embed.thumbnail && (
                                                <div style={{ flexShrink: 0 }}>
                                                    <img
                                                        src={embed.thumbnail}
                                                        alt=""
                                                        style={{ width: 80, height: 80, borderRadius: "4px", objectFit: "cover" }}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = "none"
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        {(embed.footer.text || embed.timestamp) && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "4px" }}>
                                                {embed.footer.icon_url && (
                                                    <img
                                                        src={embed.footer.icon_url}
                                                        alt=""
                                                        style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = "none"
                                                        }}
                                                    />
                                                )}
                                                <span style={{ fontSize: "11px", color: "#949ba4" }}>
                                                    {embed.footer.text}
                                                    {embed.footer.text && embed.timestamp && " • "}
                                                    {embed.timestamp &&
                                                        new Date().toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                            hour: "numeric",
                                                            minute: "2-digit",
                                                        })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
