"use client"

import type { LoggingConfig } from "@/components/dashboard/logging/logging-types"
import { CATEGORY_META, countEnabledEvents } from "@/components/dashboard/logging/logging-types"
import type { RoutableCategory } from "@/lib/logging-constants"

export function CategoryNav({
    config,
    selected,
    onSelect,
    disabled = false,
}: {
    config: LoggingConfig
    selected: RoutableCategory
    onSelect: (key: RoutableCategory) => void
    disabled?: boolean
}) {
    return (
        <div className="space-y-3">
            <div>
                <h3 className="text-lg font-bold text-white">1. Choose a category</h3>
                <p className="mt-1 text-sm text-zinc-400">
                    Select a category first. Its routing mode, channels, and event toggles appear below.
                </p>
            </div>

            <div
                className="flex flex-wrap gap-2"
                role="tablist"
                aria-label="Logging categories"
            >
                {CATEGORY_META.map(cat => {
                    const active = selected === cat.key
                    const mode = config.categoryModes[cat.key] || "category"
                    const enabled = countEnabledEvents(config, cat.events)
                    const hasChannel = Boolean(config.channels[cat.key])

                    return (
                        <button
                            key={cat.key}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            disabled={disabled}
                            onClick={() => onSelect(cat.key)}
                            className={`rounded-xl border px-3.5 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                active
                                    ? cat.key === "security"
                                        ? "border-red-500/55 bg-red-500/20"
                                        : "border-[#8b5cf6] bg-[#8b5cf6]/20"
                                    : "border-white/[0.07] bg-black/30 hover:border-white/18 hover:bg-black/45"
                            }`}
                        >
                            <div className={`text-sm font-semibold ${active ? "text-white" : "text-zinc-300"}`}>
                                {cat.label}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                                <span
                                    className={`rounded-md px-1.5 py-0.5 font-medium ${
                                        mode === "granular"
                                            ? "bg-sky-500/15 text-sky-300"
                                            : "bg-white/[0.06] text-zinc-400"
                                    }`}
                                >
                                    {mode === "granular" ? "Per event" : "One channel"}
                                </span>
                                <span className="text-zinc-500">
                                    {enabled}/{cat.events.length} on
                                </span>
                                <span
                                    className={`ml-0.5 h-1.5 w-1.5 rounded-full ${
                                        hasChannel ? "bg-emerald-400" : "bg-zinc-600"
                                    }`}
                                    title={hasChannel ? "Category channel set" : "No category channel yet"}
                                />
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
