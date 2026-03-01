"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faShield, faRotateRight } from "@fortawesome/free-solid-svg-icons"

export interface Role {
    id: string
    name: string
    color: string | null
    position: number
}

interface RolePickerProps {
    guildId: string
    value: string
    onChange: (val: string | null) => void
    disabled?: boolean
    placeholder?: string
}

const ROLE_STALE_MS = 5 * 60 * 1000 // 5 minutes (matches server-side TTL)

export function RolePicker({ guildId, value, onChange, disabled, placeholder = "Select a role..." }: RolePickerProps) {
    const queryClient = useQueryClient()

    const { data: roles = [], isLoading, isFetching, refetch } = useQuery<Role[]>({
        queryKey: ["roles", guildId],
        queryFn: async ({ meta }) => {
            const forceRefresh = meta?.forceRefresh === true
            const url = forceRefresh
                ? `/api/guilds/${guildId}/roles?refresh=true`
                : `/api/guilds/${guildId}/roles`
            const res = await fetch(url)
            if (!res.ok) throw new Error("Failed to fetch roles")
            return res.json()
        },
        staleTime: ROLE_STALE_MS,
        enabled: !!guildId,
    })

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["roles", guildId] })
        refetch({ meta: { forceRefresh: true } } as any)
    }

    if (isLoading) {
        return (
            <div className="w-full bg-black/50 border border-white/[0.06] rounded-xl p-3 text-gray-500 animate-pulse">
                Loading roles...
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faShield} className="w-4 h-4 text-gray-500" />
                </div>
                <select
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value || null)}
                    disabled={disabled}
                    className="w-full pl-10 pr-10 py-3 appearance-none bg-[#0a0a0a] border border-white/[0.06] rounded-xl text-white focus:outline-none focus:border-[#8b5cf6]/50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                    <option value="" style={{ background: '#0a0a0a', color: '#fff' }}>{placeholder}</option>
                    {roles.map(role => (
                        <option key={role.id} value={role.id} style={{ background: '#0a0a0a', color: '#fff' }}>
                            {role.name}
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
                title="Refresh role list"
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
