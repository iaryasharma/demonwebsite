"use client"

import type { CategoryRoutingMode } from "@/lib/logging-constants"

export function RoutingModeToggle({
    value,
    onChange,
}: {
    value: CategoryRoutingMode
    onChange: (mode: CategoryRoutingMode) => void
}) {
    const options: { id: CategoryRoutingMode; title: string; desc: string }[] = [
        {
            id: "category",
            title: "One channel",
            desc: "All events in this category go to a single category channel (then fallback).",
        },
        {
            id: "granular",
            title: "Per event",
            desc: "Each event can use its own channel. Unset events still use category → fallback.",
        },
    ]

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-white">How should this category route?</h4>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium capitalize text-zinc-300">
                    {value === "granular" ? "Per event" : "One channel"}
                </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Category routing mode">
                {options.map(opt => {
                    const active = value === opt.id
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => onChange(opt.id)}
                            className={`rounded-xl border p-4 text-left transition-colors ${
                                active
                                    ? "border-[#8b5cf6] bg-[#8b5cf6]/15 shadow-[0_0_0_1px_rgba(139,92,246,0.25)]"
                                    : "border-white/[0.08] bg-black/30 hover:border-white/20 hover:bg-black/40"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                        active ? "border-[#a78bfa]" : "border-zinc-600"
                                    }`}
                                    aria-hidden
                                >
                                    {active ? <span className="h-2 w-2 rounded-full bg-[#a78bfa]" /> : null}
                                </span>
                                <span className={`text-sm font-semibold ${active ? "text-white" : "text-zinc-300"}`}>
                                    {opt.title}
                                </span>
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-500">{opt.desc}</p>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
