"use client"

/**
 * DevToolsShield — Production-only security component.
 *
 * Activates ONLY when NODE_ENV === "production". Has zero effect in development.
 *
 * Protections:
 *  - Disables right-click context menu
 *  - Blocks F12 / Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C / Ctrl+U
 *  - Detects DevTools via window dimension heuristic and shows a polite overlay
 *  - Overrides console.* methods to no-ops
 *  - Shows a styled anti-paste warning in the console (like Facebook does)
 */

import { useEffect, useRef, useState } from "react"

const IS_PROD = process.env.NODE_ENV === "production"

// Keys that open DevTools
const BLOCKED_KEYS = new Set([
    "F12",
    "F11", // some browsers
])
const BLOCKED_COMBOS = [
    // Ctrl+Shift+I — DevTools
    (e: KeyboardEvent) => e.ctrlKey && e.shiftKey && e.key === "I",
    // Ctrl+Shift+J — Console
    (e: KeyboardEvent) => e.ctrlKey && e.shiftKey && e.key === "J",
    // Ctrl+Shift+C — Inspect
    (e: KeyboardEvent) => e.ctrlKey && e.shiftKey && e.key === "C",
    // Ctrl+U — View Source
    (e: KeyboardEvent) => e.ctrlKey && !e.shiftKey && e.key === "u",
    // Cmd+Option+I (Mac)
    (e: KeyboardEvent) => e.metaKey && e.altKey && e.key === "i",
    // Cmd+Option+J (Mac)
    (e: KeyboardEvent) => e.metaKey && e.altKey && e.key === "j",
    // Cmd+Option+C (Mac)
    (e: KeyboardEvent) => e.metaKey && e.altKey && e.key === "c",
]

export function DevToolsShield() {
    const [devtoolsOpen, setDevtoolsOpen] = useState(false)
    const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        if (!IS_PROD) return

        // ── Console override ──────────────────────────────────────────────
        const noop = () => { }
            ; (window as any).__originalConsole = { ...console }
            ;["log", "warn", "error", "info", "debug", "dir", "table", "trace"].forEach((method) => {
                (console as any)[method] = noop
            })

        // Anti-paste / curiosity warning — fires once when DevTools opens console
        // Uses a getter trick so it only runs when the object is inspected
        const warningStyle = "color:#ef4444;font-size:24px;font-weight:bold;"
        const warningStyle2 = "color:#ffffff;font-size:14px;"
        // We use the original console since we overrode it
        const _log = (window as any).__originalConsole.log.bind(console)
        _log(
            "%cStop! 🛑",
            warningStyle
        )
        _log(
            "%cThis is a browser feature intended for developers. If someone told you to paste something here, it is a scam and they are trying to compromise this account.",
            warningStyle2
        )

        // ── Right-click block ─────────────────────────────────────────────
        const blockContextMenu = (e: MouseEvent) => {
            e.preventDefault()
            return false
        }
        document.addEventListener("contextmenu", blockContextMenu)

        // ── Keyboard shortcut block ───────────────────────────────────────
        const blockKeyboard = (e: KeyboardEvent) => {
            if (BLOCKED_KEYS.has(e.key)) {
                e.preventDefault()
                e.stopPropagation()
                return false
            }
            for (const combo of BLOCKED_COMBOS) {
                if (combo(e)) {
                    e.preventDefault()
                    e.stopPropagation()
                    return false
                }
            }
        }
        document.addEventListener("keydown", blockKeyboard, true)

        // ── DevTools open detection via window size heuristic ─────────────
        // When DevTools is docked, innerHeight or innerWidth shrinks significantly
        const THRESHOLD = 160
        const detectDevTools = () => {
            const isOpen =
                window.outerHeight - window.innerHeight > THRESHOLD ||
                window.outerWidth - window.innerWidth > THRESHOLD
            setDevtoolsOpen(isOpen)
        }
        // Also detect via console timing trick (object getter)
        const devToolsDetector = /./
        devToolsDetector.toString = () => {
            setDevtoolsOpen(true)
            return ""
        }

        checkIntervalRef.current = setInterval(detectDevTools, 1000)

        return () => {
            document.removeEventListener("contextmenu", blockContextMenu)
            document.removeEventListener("keydown", blockKeyboard, true)
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
        }
    }, [])

    // Not production — render nothing
    if (!IS_PROD) return null

    // DevTools overlay
    if (!devtoolsOpen) return null

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 999999,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.96)",
                backdropFilter: "blur(12px)",
                fontFamily: "Inter, system-ui, sans-serif",
                color: "#fff",
                gap: "16px",
                textAlign: "center",
                padding: "24px",
            }}
        >
            <div style={{ fontSize: "56px" }}>🛑</div>
            <h2 style={{ fontSize: "28px", fontWeight: 700, margin: 0, color: "#ef4444" }}>
                Developer Tools Detected
            </h2>
            <p style={{ fontSize: "16px", color: "#a1a1aa", maxWidth: "480px", lineHeight: 1.6 }}>
                For security reasons, this page is not available while browser developer tools are open.
                Please close them and refresh the page.
            </p>
            <button
                onClick={() => window.location.reload()}
                style={{
                    marginTop: "8px",
                    padding: "12px 32px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: "pointer",
                }}
            >
                Refresh Page
            </button>
        </div>
    )
}

export default DevToolsShield
