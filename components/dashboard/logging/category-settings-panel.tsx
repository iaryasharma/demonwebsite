"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons"
import { ChannelPicker } from "@/components/dashboard/settings/channel-picker"
import { LoggingToggle } from "@/components/dashboard/logging/logging-toggle"
import { RoutingModeToggle } from "@/components/dashboard/logging/routing-mode-toggle"
import {
    CATEGORY_META,
    EVENT_LABELS,
    countEnabledEvents,
    type ChannelKey,
    type EventKey,
    type LoggingConfig,
} from "@/components/dashboard/logging/logging-types"
import type { CategoryRoutingMode, RoutableCategory } from "@/lib/logging-constants"

export function CategorySettingsPanel({
    guildId,
    categoryKey,
    config,
    onChange,
    disabled = false,
}: {
    guildId: string
    categoryKey: RoutableCategory
    config: LoggingConfig
    onChange: (next: LoggingConfig) => void
    disabled?: boolean
}) {
    const cat = CATEGORY_META.find(c => c.key === categoryKey) ?? CATEGORY_META[0]
    const mode = config.categoryModes[cat.key] || "category"
    const enabledCount = countEnabledEvents(config, cat.events)

    const patch = (partial: Partial<LoggingConfig> | ((prev: LoggingConfig) => LoggingConfig)) => {
        if (typeof partial === "function") onChange(partial(config))
        else onChange({ ...config, fallbackOnly: false, ...partial })
    }

    const setMode = (next: CategoryRoutingMode) => {
        patch({
            categoryModes: { ...config.categoryModes, [cat.key]: next },
        })
    }

    const setChannel = (key: ChannelKey, val: string | null) => {
        const channels = { ...config.channels, [key]: val }
        const eventChannels =
            key === "security"
                ? { ...config.eventChannels, securityViolation: val }
                : config.eventChannels
        patch({ channels, eventChannels })
    }

    const setAllEvents = (enabled: boolean) => {
        const events = { ...config.events }
        for (const e of cat.events) events[e] = enabled
        patch({ events })
    }

    return (
        <section
            className={`space-y-6 rounded-2xl border p-5 sm:p-6 ${
                cat.key === "security"
                    ? "border-red-500/25 bg-red-500/[0.04]"
                    : "border-white/[0.06] bg-zinc-950/80"
            } ${disabled ? "pointer-events-none opacity-45" : ""}`}
            aria-labelledby={`logging-cat-${cat.key}`}
        >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">2. Configure category</p>
                    <h3 id={`logging-cat-${cat.key}`} className="mt-1 text-xl font-bold text-white">
                        {cat.label}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-400">{cat.blurb}</p>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2 text-right">
                    <div className="text-[11px] uppercase tracking-wide text-zinc-500">Events on</div>
                    <div className="text-sm font-semibold text-white">
                        {enabledCount}
                        <span className="text-zinc-500"> / {cat.events.length}</span>
                    </div>
                </div>
            </div>

            <RoutingModeToggle value={mode} onChange={setMode} />

            <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">
                    Category channel
                    <span className="mt-0.5 block text-xs font-normal text-zinc-500">
                        {mode === "category"
                            ? "All enabled events in this category use this channel (then fallback)."
                            : "Used when an event has no dedicated channel of its own."}
                    </span>
                </label>
                <ChannelPicker
                    guildId={guildId}
                    value={config.channels[cat.key] || ""}
                    onChange={val => setChannel(cat.key, val || null)}
                />
            </div>

            {cat.key === "expressions" && (
                <div className="space-y-3 rounded-xl border border-white/[0.06] bg-black/25 p-4">
                    <div>
                        <h4 className="text-sm font-semibold text-white">Optional splits</h4>
                        <p className="mt-1 text-xs text-zinc-500">
                            Override the shared Expressions channel for emoji-only or soundboard-only events.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-zinc-400">Emoji channel</label>
                            <ChannelPicker
                                guildId={guildId}
                                value={config.channels.emoji || ""}
                                onChange={val => setChannel("emoji", val || null)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-zinc-400">Soundboard channel</label>
                            <ChannelPicker
                                guildId={guildId}
                                value={config.channels.soundboard || ""}
                                onChange={val => setChannel("soundboard", val || null)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {mode === "granular" && (
                <div className="space-y-3">
                    <div>
                        <h4 className="text-sm font-semibold text-white">Per-event channels</h4>
                        <p className="mt-1 text-xs text-zinc-500">
                            Leave blank to inherit category channel → fallback.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {cat.events.map((eventKey: EventKey) => (
                            <div
                                key={eventKey}
                                className="space-y-1.5 rounded-xl border border-white/[0.05] bg-black/30 p-3"
                            >
                                <label className="block text-sm font-medium text-zinc-200">
                                    {EVENT_LABELS[eventKey]}
                                </label>
                                {eventKey === "securityViolation" ? (
                                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2.5">
                                        <p className="mb-2 flex items-center gap-1.5 text-[11px] text-red-300">
                                            <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3" />
                                            Uses the Security category channel
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
                                            patch({
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

            <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h4 className="text-sm font-semibold text-white">Event toggles</h4>
                        <p className="mt-0.5 text-xs text-zinc-500">
                            Turn individual events on or off for this category.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setAllEvents(true)}
                            className="rounded-lg border border-white/[0.08] px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-emerald-500/30 hover:text-emerald-300"
                        >
                            Enable all
                        </button>
                        <button
                            type="button"
                            onClick={() => setAllEvents(false)}
                            className="rounded-lg border border-white/[0.08] px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-red-500/30 hover:text-red-300"
                        >
                            Disable all
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {cat.events.map(key => (
                        <label
                            key={key}
                            className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-black/30 px-3 py-2.5 transition-colors hover:bg-black/45"
                        >
                            <span className="text-sm font-medium text-zinc-200">{EVENT_LABELS[key]}</span>
                            <LoggingToggle
                                checked={Boolean(config.events[key])}
                                aria-label={`Toggle ${EVENT_LABELS[key]}`}
                                onChange={next =>
                                    patch({
                                        events: { ...config.events, [key]: next },
                                    })
                                }
                            />
                        </label>
                    ))}
                </div>
            </div>
        </section>
    )
}
