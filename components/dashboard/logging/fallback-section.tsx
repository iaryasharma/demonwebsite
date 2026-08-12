"use client"

import { ChannelPicker } from "@/components/dashboard/settings/channel-picker"
import { LoggingToggle } from "@/components/dashboard/logging/logging-toggle"
import type { LoggingConfig } from "@/components/dashboard/logging/logging-types"

export function FallbackSection({
    guildId,
    config,
    onChange,
}: {
    guildId: string
    config: LoggingConfig
    onChange: (next: LoggingConfig) => void
}) {
    return (
        <section className="space-y-4 rounded-2xl border border-white/[0.06] bg-zinc-950/80 p-5 sm:p-6">
            <div>
                <h3 className="text-lg font-bold text-white">Fallback channel</h3>
                <p className="mt-1 text-sm text-zinc-400">
                    Used when a category or event has no channel of its own. Same as the bot&apos;s{" "}
                    <code className="rounded bg-white/[0.05] px-1 text-zinc-300">/logs channel</code> fallback.
                </p>
            </div>

            <ChannelPicker
                guildId={guildId}
                value={config.channelId || ""}
                onChange={val => onChange({ ...config, channelId: val || null })}
            />

            <div className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.07] bg-black/30 p-4">
                <div className="min-w-0">
                    <div className="font-semibold text-white">Send everything to fallback</div>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                        When on, all events go only to the fallback channel (legacy single-channel mode).
                        Turn off to configure each category separately.
                    </p>
                </div>
                <LoggingToggle
                    checked={config.fallbackOnly}
                    aria-label="Send everything to fallback"
                    onChange={fallbackOnly => onChange({ ...config, fallbackOnly })}
                />
            </div>
        </section>
    )
}
