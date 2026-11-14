"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { faArrowLeft, faSpinner } from "@fortawesome/free-solid-svg-icons"

/** Header used by the module settings pages. */
export function ModuleHeader({ guildId, icon, title, description }: { guildId: string; icon: IconDefinition; title: string; description: string }) {
    return (
        <div className="flex items-center gap-4 mb-8">
            <Link
                href={`/dashboard/${guildId}/modules`}
                aria-label="Back to modules"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
            </Link>
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <FontAwesomeIcon icon={icon} className="w-7 h-7 text-[#8b5cf6]" />
                    {title}
                </h1>
                <p className="text-gray-400 mt-1">{description}</p>
            </div>
        </div>
    )
}

export function LoadingState() {
    return (
        <div className="min-h-[400px] flex items-center justify-center" role="status" aria-label="Loading">
            <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#8b5cf6] animate-spin" />
        </div>
    )
}

export function ErrorState({ message }: { message: string }) {
    return <div className="glass rounded-2xl border border-red-500/30 p-6 text-red-300">{message}</div>
}

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
    return (
        <section className="glass rounded-2xl border border-white/[0.06] p-6 space-y-5">
            <div className="pb-3 border-b border-white/[0.06]">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
            </div>
            {children}
        </section>
    )
}

export function Toggle({ label, description, checked, onChange, disabled }: {
    label: string
    description?: string
    checked: boolean
    onChange: (v: boolean) => void
    disabled?: boolean
}) {
    return (
        <label className={`flex items-start justify-between gap-4 ${disabled ? "opacity-50" : "cursor-pointer"}`}>
            <span>
                <span className="font-semibold text-white block">{label}</span>
                {description && <span className="text-sm text-gray-400 block mt-0.5">{description}</span>}
            </span>
            <span className="relative shrink-0 mt-1">
                <input type="checkbox" className="sr-only peer" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
                <span className={`block w-10 h-6 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#8b5cf6] ${checked ? "bg-[#8b5cf6]" : "bg-gray-700"}`} />
                <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? "translate-x-4" : ""}`} />
            </span>
        </label>
    )
}

/** Integer input that only reports values inside [min, max]. */
export function NumberField({ label, description, value, min, max, onChange, suffix }: {
    label: string
    description?: string
    value: number
    min: number
    max: number
    onChange: (v: number) => void
    suffix?: string
}) {
    const [text, setText] = useState(String(value))
    useEffect(() => setText(String(value)), [value])
    return (
        <label className="block space-y-1.5">
            <span className="font-semibold text-white block">{label}</span>
            {description && <span className="text-sm text-gray-400 block">{description}</span>}
            <span className="flex items-center gap-2">
                <input
                    type="number"
                    inputMode="numeric"
                    min={min}
                    max={max}
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value)
                        const n = Number(e.target.value)
                        if (Number.isInteger(n) && n >= min && n <= max) onChange(n)
                    }}
                    onBlur={() => setText(String(value))}
                    className="w-32 bg-black/40 border border-white/[0.06] text-white text-sm rounded-xl focus:ring-[#8b5cf6] focus:border-[#8b5cf6] p-2.5"
                />
                {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
            </span>
        </label>
    )
}

/**
 * Edit a list of strings as a textarea, one entry per line. The list is updated on blur so typing
 * stays smooth with thousands of entries.
 */
export function ListEditor({ label, description, value, onChange, max, placeholder, rows = 6 }: {
    label: string
    description?: string
    value: string[]
    onChange: (v: string[]) => void
    max: number
    placeholder?: string
    rows?: number
}) {
    const [text, setText] = useState(value.join("\n"))
    useEffect(() => setText(value.join("\n")), [value])
    const count = text.split("\n").filter((l) => l.trim()).length
    return (
        <label className="block space-y-1.5">
            <span className="flex items-center justify-between">
                <span className="font-semibold text-white">{label}</span>
                <span className={`text-xs ${count > max ? "text-red-400" : "text-gray-500"}`}>{count} / {max}</span>
            </span>
            {description && <span className="text-sm text-gray-400 block">{description}</span>}
            <textarea
                rows={rows}
                value={text}
                placeholder={placeholder}
                spellCheck={false}
                onChange={(e) => setText(e.target.value)}
                onBlur={() => onChange([...new Set(text.split("\n").map((l) => l.trim()).filter(Boolean))])}
                className="w-full bg-black/40 border border-white/[0.06] text-white text-sm rounded-xl focus:ring-[#8b5cf6] focus:border-[#8b5cf6] p-3 font-mono"
            />
        </label>
    )
}
