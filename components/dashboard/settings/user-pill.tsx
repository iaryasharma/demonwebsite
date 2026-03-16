"use client"

import { useQuery } from "@tanstack/react-query"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark, faShieldHalved, faSpinner, faUser } from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"

interface UserPillProps {
    guildId: string
    userId: string
    categories: string[]
    entryId: string
    isProtected?: boolean
    reason?: string | null
    onRemove?: (id: string) => void
    isRemoving?: boolean
}

interface DiscordUser {
    id: string
    username: string
    displayName: string
    avatarUrl: string
    bot: boolean
    systemType?: 'bot' | 'team' | 'owner'
}

const CATEGORY_LABELS: Record<string, string> = {
    all: 'Global',
    role: 'Roles',
    channel: 'Channels',
    kick: 'Kick',
    ban: 'Ban',
    prune: 'Prune',
    adminActions: 'Admin',
    addBots: 'Add Bots',
}

export function UserPill({ guildId, userId, categories, entryId, isProtected, reason, onRemove, isRemoving }: UserPillProps) {
    const SYSTEM_IDS = ["730424922639302693", "836880109478608897", "795487020935510017"]
    const normalizedId = userId.replace(/^[a-z]+(?=\d)/i, "")
    const effectivelyProtected = isProtected || SYSTEM_IDS.includes(normalizedId)

    const { data: user, isLoading } = useQuery<DiscordUser>({
        queryKey: ["discord-user", guildId, userId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/members/${userId}`)
            if (!res.ok) throw new Error("Failed to resolve user")
            return res.json()
        },
        staleTime: 600_000, // 10 minutes
    })

    const displayName = user?.displayName || userId
    const avatarUrl = user?.avatarUrl
    const isBot = user?.bot || user?.systemType === 'bot'
    const systemType = user?.systemType

    return (
        <div className={`flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-full border text-sm font-medium transition-all group
            ${effectivelyProtected
                ? 'bg-[#8b5cf6]/5 border-[#8b5cf6]/20 text-[#8b5cf6]/90'
                : 'bg-white/5 border-white/10 text-white hover:border-[#8b5cf6]/40'
            }`}
        >
            {/* Avatar */}
            <div className="relative w-6 h-6 flex-shrink-0">
                {isLoading ? (
                    <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
                ) : avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt={displayName}
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="w-6 h-6 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="w-3 h-3 text-[#8b5cf6]" />
                    </div>
                )}
                {isBot && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#5865F2] rounded-full flex items-center justify-center border border-[#0a0a0a]">
                        <span className="text-[4px] text-white font-black leading-none">BOT</span>
                    </div>
                )}
            </div>

            {/* Name */}
            <div className="flex flex-col min-w-0">
                <span className="max-w-[120px] truncate text-xs font-semibold leading-tight">
                    {isLoading ? (
                        <span className="block w-20 h-3 bg-white/10 rounded animate-pulse" />
                    ) : displayName}
                </span>
                {systemType && systemType !== 'bot' && (
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                        {systemType}
                    </span>
                )}
            </div>

            {/* Category tags */}
            <div className="flex items-center gap-1">
                {categories.slice(0, 2).map(cat => (
                    <span key={cat} className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide
                        ${cat === 'all' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 'bg-white/5 text-gray-500'}`}
                    >
                        {CATEGORY_LABELS[cat] || cat}
                    </span>
                ))}
                {categories.length > 2 && (
                    <span className="text-[9px] text-gray-500 font-bold">+{categories.length - 2}</span>
                )}
            </div>

            {/* Protected icon or Remove button */}
            {effectivelyProtected ? (
                <div title="System protected — cannot be removed" className="w-6 h-6 flex items-center justify-center px-1">
                    <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 text-[#8b5cf6]" />
                </div>
            ) : (
                <button
                    onClick={() => onRemove?.(entryId)}
                    disabled={isRemoving}
                    className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all disabled:opacity-50"
                    title="Remove from whitelist"
                >
                    {isRemoving ? (
                        <FontAwesomeIcon icon={faSpinner} className="w-2.5 h-2.5 animate-spin" />
                    ) : (
                        <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                    )}
                </button>
            )}
        </div>
    )
}


