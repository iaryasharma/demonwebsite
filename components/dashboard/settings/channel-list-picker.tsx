"use client"

import { useQueryClient } from "@tanstack/react-query"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { ChannelPicker } from "@/components/dashboard/settings/channel-picker"

/**
 * Pick several channels. Reuses ChannelPicker (and its cached ["channels", guildId] query), so it adds no
 * extra requests; names for the chips come from that same cache.
 */
export function ChannelListPicker({ guildId, value, onChange, max }: {
    guildId: string
    value: string[]
    onChange: (v: string[]) => void
    max: number
}) {
    const channels = useQueryClient().getQueryData<{ id: string; name: string }[]>(["channels", guildId]) ?? []
    const nameOf = (id: string) => channels.find((c) => c.id === id)?.name ?? id

    return (
        <div className="space-y-2">
            {value.length < max && (
                <ChannelPicker guildId={guildId} value="" onChange={(id) => id && !value.includes(id) && onChange([...value, id])} />
            )}
            {value.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                    {value.map((id) => (
                        <li key={id} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-sm text-gray-200">
                            #{nameOf(id)}
                            <button type="button" aria-label={`Remove #${nameOf(id)}`} onClick={() => onChange(value.filter((v) => v !== id))} className="text-gray-400 hover:text-white">
                                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
