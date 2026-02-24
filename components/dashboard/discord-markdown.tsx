"use client"

import React from "react"

/**
 * Discord Markdown Renderer
 * Parses Discord-style markdown and renders it as React elements
 * with Discord's exact styling.
 */

interface DiscordMarkdownProps {
    text: string
    className?: string
}

// Parse inline formatting recursively
function parseInline(text: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = []
    let remaining = text
    let key = 0

    while (remaining.length > 0) {
        let matched = false

        // Inline code (highest priority)
        const codeMatch = remaining.match(/^`([^`]+)`/)
        if (codeMatch) {
            nodes.push(
                <code
                    key={key++}
                    style={{
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: "3px",
                        padding: "0 4px",
                        fontSize: "0.85em",
                        fontFamily: "Consolas, 'Courier New', monospace",
                        color: "#e8e6e3",
                    }}
                >
                    {codeMatch[1]}
                </code>
            )
            remaining = remaining.slice(codeMatch[0].length)
            matched = true
            continue
        }

        // Bold + Italic ***text***
        const boldItalicMatch = remaining.match(/^\*\*\*(.+?)\*\*\*/)
        if (boldItalicMatch) {
            nodes.push(
                <strong key={key++} style={{ fontWeight: 700 }}>
                    <em>{parseInline(boldItalicMatch[1])}</em>
                </strong>
            )
            remaining = remaining.slice(boldItalicMatch[0].length)
            matched = true
            continue
        }

        // Bold **text**
        const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
        if (boldMatch) {
            nodes.push(
                <strong key={key++} style={{ fontWeight: 700, color: "#f2f3f5" }}>
                    {parseInline(boldMatch[1])}
                </strong>
            )
            remaining = remaining.slice(boldMatch[0].length)
            matched = true
            continue
        }

        // Underline __text__
        const underlineMatch = remaining.match(/^__(.+?)__/)
        if (underlineMatch) {
            nodes.push(
                <span key={key++} style={{ textDecoration: "underline" }}>
                    {parseInline(underlineMatch[1])}
                </span>
            )
            remaining = remaining.slice(underlineMatch[0].length)
            matched = true
            continue
        }

        // Italic *text* or _text_
        const italicMatch = remaining.match(/^\*(.+?)\*/) || remaining.match(/^_(.+?)_/)
        if (italicMatch) {
            nodes.push(
                <em key={key++}>{parseInline(italicMatch[1])}</em>
            )
            remaining = remaining.slice(italicMatch[0].length)
            matched = true
            continue
        }

        // Strikethrough ~~text~~
        const strikeMatch = remaining.match(/^~~(.+?)~~/)
        if (strikeMatch) {
            nodes.push(
                <span key={key++} style={{ textDecoration: "line-through" }}>
                    {parseInline(strikeMatch[1])}
                </span>
            )
            remaining = remaining.slice(strikeMatch[0].length)
            matched = true
            continue
        }

        // Spoiler ||text||
        const spoilerMatch = remaining.match(/^\|\|(.+?)\|\|/)
        if (spoilerMatch) {
            nodes.push(
                <span
                    key={key++}
                    style={{
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: "3px",
                        padding: "0 2px",
                        cursor: "pointer",
                    }}
                    title="Spoiler"
                >
                    {parseInline(spoilerMatch[1])}
                </span>
            )
            remaining = remaining.slice(spoilerMatch[0].length)
            matched = true
            continue
        }

        // Masked links [text](url)
        const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
        if (linkMatch) {
            nodes.push(
                <a
                    key={key++}
                    href={linkMatch[2]}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#00a8fc", textDecoration: "none" }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.textDecoration = "underline" }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.textDecoration = "none" }}
                >
                    {linkMatch[1]}
                </a>
            )
            remaining = remaining.slice(linkMatch[0].length)
            matched = true
            continue
        }

        // Plain URL
        const urlMatch = remaining.match(/^(https?:\/\/[^\s<]+)/)
        if (urlMatch) {
            nodes.push(
                <a
                    key={key++}
                    href={urlMatch[1]}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#00a8fc", textDecoration: "none" }}
                >
                    {urlMatch[1]}
                </a>
            )
            remaining = remaining.slice(urlMatch[0].length)
            matched = true
            continue
        }

        if (!matched) {
            // Consume single character
            const nextSpecial = remaining.slice(1).search(/[*_~`|[\]h]/)
            if (nextSpecial === -1) {
                nodes.push(remaining)
                remaining = ""
            } else {
                nodes.push(remaining.slice(0, nextSpecial + 1))
                remaining = remaining.slice(nextSpecial + 1)
            }
        }
    }

    return nodes
}

// Parse block-level formatting
function parseBlocks(text: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = []
    let key = 0

    // Split by code blocks first
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g
    const parts: { type: "text" | "codeblock"; content: string; lang?: string }[] = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: "text", content: text.slice(lastIndex, match.index) })
        }
        parts.push({ type: "codeblock", content: match[2], lang: match[1] || undefined })
        lastIndex = match.index + match[0].length
    }
    if (lastIndex < text.length) {
        parts.push({ type: "text", content: text.slice(lastIndex) })
    }

    for (const part of parts) {
        if (part.type === "codeblock") {
            nodes.push(
                <pre
                    key={key++}
                    style={{
                        background: "#1e1f22",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "4px",
                        padding: "8px 12px",
                        margin: "4px 0",
                        fontSize: "0.8125rem",
                        fontFamily: "Consolas, 'Courier New', monospace",
                        color: "#dbdee1",
                        overflowX: "auto",
                        whiteSpace: "pre",
                        lineHeight: 1.4,
                    }}
                >
                    <code>{part.content.replace(/\n$/, "")}</code>
                </pre>
            )
        } else {
            // Parse line by line for block-level elements
            const lines = part.content.split("\n")
            let i = 0

            while (i < lines.length) {
                const line = lines[i]

                // Heading ###
                const h3Match = line.match(/^### (.+)/)
                if (h3Match) {
                    nodes.push(
                        <p key={key++} style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#f2f3f5", margin: "8px 0 2px" }}>
                            {parseInline(h3Match[1])}
                        </p>
                    )
                    i++
                    continue
                }

                // Heading ##
                const h2Match = line.match(/^## (.+)/)
                if (h2Match) {
                    nodes.push(
                        <p key={key++} style={{ fontSize: "1.125rem", fontWeight: 700, color: "#f2f3f5", margin: "8px 0 2px" }}>
                            {parseInline(h2Match[1])}
                        </p>
                    )
                    i++
                    continue
                }

                // Heading #
                const h1Match = line.match(/^# (.+)/)
                if (h1Match) {
                    nodes.push(
                        <p key={key++} style={{ fontSize: "1.375rem", fontWeight: 800, color: "#f2f3f5", margin: "8px 0 4px" }}>
                            {parseInline(h1Match[1])}
                        </p>
                    )
                    i++
                    continue
                }

                // Blockquote >
                if (line.startsWith("> ") || line === ">") {
                    // Collect consecutive blockquote lines
                    const quoteLines: string[] = []
                    while (i < lines.length && (lines[i].startsWith("> ") || lines[i] === ">")) {
                        quoteLines.push(lines[i].replace(/^> ?/, ""))
                        i++
                    }
                    nodes.push(
                        <div
                            key={key++}
                            style={{
                                borderLeft: "4px solid #4e5058",
                                paddingLeft: "12px",
                                margin: "2px 0",
                                color: "#b5bac1",
                            }}
                        >
                            {quoteLines.map((ql, qi) => (
                                <React.Fragment key={qi}>
                                    {parseInline(ql)}
                                    {qi < quoteLines.length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </div>
                    )
                    continue
                }

                // Unordered list item
                const listMatch = line.match(/^(\s*)[*-] (.+)/)
                if (listMatch) {
                    const listItems: { indent: number; content: string }[] = []
                    while (i < lines.length) {
                        const lm = lines[i].match(/^(\s*)[*-] (.+)/)
                        if (lm) {
                            listItems.push({ indent: lm[1].length, content: lm[2] })
                            i++
                        } else {
                            break
                        }
                    }
                    nodes.push(
                        <ul key={key++} style={{ margin: "2px 0", paddingLeft: "20px", listStyleType: "disc" }}>
                            {listItems.map((item, li) => (
                                <li key={li} style={{ marginLeft: Math.min(item.indent, 4) * 8, margin: "1px 0" }}>
                                    {parseInline(item.content)}
                                </li>
                            ))}
                        </ul>
                    )
                    continue
                }

                // Empty line
                if (line.trim() === "") {
                    nodes.push(<div key={key++} style={{ height: "0.5em" }} />)
                    i++
                    continue
                }

                // Regular line
                nodes.push(
                    <React.Fragment key={key++}>
                        {parseInline(line)}
                        {i < lines.length - 1 && <br />}
                    </React.Fragment>
                )
                i++
            }
        }
    }

    return nodes
}

export function DiscordMarkdown({ text, className }: DiscordMarkdownProps) {
    if (!text) return null
    return <div className={className}>{parseBlocks(text)}</div>
}
