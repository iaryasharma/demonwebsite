"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faHashtag } from "@fortawesome/free-solid-svg-icons"

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

export function ChannelPicker({ guildId, value, onChange, disabled }: ChannelPickerProps) {
    const [channels, setChannels] = useState<Channel[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchChannels() {
            try {
                const res = await fetch(`/api/guilds/${guildId}/channels`)
                if (res.ok) {
                    const data = await res.json()
                    setChannels(data)
                }
            } catch (error) {
                console.error("Failed to load channels:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchChannels()
    }, [guildId])

    if (loading) {
        return (
            <div className="w-full bg-black/50 border border-white/[0.06] rounded-xl p-3 text-gray-500 animate-pulse">
                Loading channels...
            </div>
        )
    }

    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faHashtag} className="w-4 h-4 text-gray-500" />
            </div>
            <select
                value={value || ""}
                onChange={(e) => onChange(e.target.value || null)}
                disabled={disabled}
                className="w-full pl-10 pr-10 py-3 appearance-none bg-black/50 border border-white/[0.06] rounded-xl text-white focus:outline-none focus:border-[#8b5cf6]/50 transition-colors disabled:opacity-50 cursor-pointer"
            >
                <option value="" className="bg-gray-900">Select a channel...</option>
                {channels.map(channel => (
                    <option key={channel.id} value={channel.id} className="bg-gray-900">
                        {channel.name}
                    </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4 text-gray-500" />
            </div>
        </div>
    )
}
