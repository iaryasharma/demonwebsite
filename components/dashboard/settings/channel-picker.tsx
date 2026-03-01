"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faHashtag, faRotateRight } from "@fortawesome/free-solid-svg-icons"

interface Channel {
    id: string
    name: string
    type: number
}

interface ChannelPickerProps {
    guildId: string
    value: string
    onChange: (val: string | null) => void
    disabled?: boolean
}

const CHANNEL_STALE_MS = 5 * 60 * 1000 // 5 minutes (matches server-side TTL)

export function ChannelPicker({ guildId, value, onChange, disabled }: ChannelPickerProps) {
    const queryClient = useQueryClient()

    const { data: channels = [], isLoading, isFetching, refetch } = useQuery<Channel[]>({
        queryKey: ["channels", guildId],
        queryFn: async ({ meta }) => {
            const forceRefresh = meta?.forceRefresh === true
            const url = forceRefresh
                ? `/api/guilds/${guildId}/channels?refresh=true`
                : `/api/guilds/${guildId}/channels`
            const res = await fetch(url)
            if (!res.ok) throw new Error("Failed to fetch channels")
            return res.json()
        },
        staleTime: CHANNEL_STALE_MS,
        enabled: !!guildId,
    })

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["channels", guildId] })
        refetch({ meta: { forceRefresh: true } } as any)
    }

    if (isLoading) {
        return (
            <div className="w-full bg-black/50 border border-white/[0.06] rounded-xl p-3 text-gray-500 animate-pulse">
                Loading channels...
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faHashtag} className="w-4 h-4 text-gray-500" />
                </div>
                <select
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value || null)}
                    disabled={disabled}
                    className="w-full pl-10 pr-10 py-3 appearance-none bg-[#0a0a0a] border border-white/[0.06] rounded-xl text-white focus:outline-none focus:border-[#8b5cf6]/50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                    <option value="" style={{ background: '#0a0a0a', color: '#fff' }}>Select a channel...</option>
                    {channels.map(channel => (
                        <option key={channel.id} value={channel.id} style={{ background: '#0a0a0a', color: '#fff' }}>
                            {channel.name}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4 text-gray-500" />
                </div>
            </div>
            <button
                type="button"
                onClick={handleRefresh}
                disabled={isFetching}
                title="Refresh channel list"
                className="flex-shrink-0 p-2.5 rounded-xl bg-black/50 border border-white/[0.06] text-gray-400 hover:text-white hover:border-[#8b5cf6]/50 transition-colors disabled:opacity-40"
            >
                <FontAwesomeIcon
                    icon={faRotateRight}
                    className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
                />
            </button>
        </div>
    )
}
