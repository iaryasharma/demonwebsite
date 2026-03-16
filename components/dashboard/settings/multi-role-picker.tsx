"use client"

import React, { useState, useEffect, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
    faChevronDown, 
    faShield, 
    faRotateRight, 
    faXmark,
    faSearch,
    faCheck
} from "@fortawesome/free-solid-svg-icons"
import { motion, AnimatePresence } from "framer-motion"

export interface Role {
    id: string
    name: string
    color: string | null
    position: number
}

interface MultiRolePickerProps {
    guildId: string
    value: string[]
    onChange: (val: string[]) => void
    disabled?: boolean
    placeholder?: string
}

const ROLE_STALE_MS = 5 * 60 * 1000

export function MultiRolePicker({ guildId, value, onChange, disabled, placeholder = "Select roles..." }: MultiRolePickerProps) {
    const queryClient = useQueryClient()
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState("")
    const containerRef = useRef<HTMLDivElement>(null)

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleToggleRole = (roleId: string) => {
        if (value.includes(roleId)) {
            onChange(value.filter(id => id !== roleId))
        } else {
            onChange([...value, roleId])
        }
    }

    const handleRemoveRole = (roleId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(value.filter(id => id !== roleId))
    }

    const handleRefresh = (e: React.MouseEvent) => {
        e.stopPropagation()
        queryClient.invalidateQueries({ queryKey: ["roles", guildId] })
        refetch({ meta: { forceRefresh: true } } as any)
    }

    const filteredRoles = roles.filter(role => 
        role.name.toLowerCase().includes(search.toLowerCase())
    )

    const selectedRoles = roles.filter(role => value.includes(role.id))

    if (isLoading) {
        return (
            <div className="w-full bg-black/50 border border-white/[0.06] rounded-xl p-3 text-gray-500 animate-pulse">
                Loading roles...
            </div>
        )
    }

    return (
        <div className="relative w-full" ref={containerRef}>
            <div 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full min-h-[48px] pl-10 pr-10 py-2 bg-[#0a0a0a] border rounded-xl flex flex-wrap gap-2 items-center cursor-pointer transition-all ${isOpen ? 'border-[#8b5cf6] ring-1 ring-[#8b5cf6]/20' : 'border-white/[0.06] hover:border-white/20'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faShield} className="w-4 h-4 text-gray-500" />
                </div>

                {selectedRoles.length === 0 ? (
                    <span className="text-gray-500 text-sm">{placeholder}</span>
                ) : (
                    selectedRoles.map(role => (
                        <div 
                            key={role.id}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-xs font-medium text-white group transition-colors hover:bg-[#8b5cf6]/20"
                        >
                            <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: role.color === '#000000' || !role.color ? '#8b5cf6' : role.color }} 
                            />
                            {role.name}
                            <FontAwesomeIcon 
                                icon={faXmark} 
                                onClick={(e) => handleRemoveRole(role.id, e)}
                                className="w-2.5 h-2.5 text-gray-500 hover:text-white cursor-pointer"
                            />
                        </div>
                    ))
                )}

                <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={isFetching}
                        className="p-1 text-gray-500 hover:text-white transition-colors"
                    >
                        <FontAwesomeIcon 
                            icon={faRotateRight} 
                            className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} 
                        />
                    </button>
                    <FontAwesomeIcon icon={faChevronDown} className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 mt-2 w-full bg-[#0f0f12] border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
                    >
                        <div className="p-2 border-b border-white/5">
                            <div className="relative">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                                <input 
                                    type="text"
                                    placeholder="Search roles..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:border-[#8b5cf6]/30"
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                            {filteredRoles.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">No roles found</div>
                            ) : (
                                filteredRoles.map(role => {
                                    const isSelected = value.includes(role.id)
                                    return (
                                        <div
                                            key={role.id}
                                            onClick={() => handleToggleRole(role.id)}
                                            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-[#8b5cf6]/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-3 h-3 rounded-full shadow-sm" 
                                                    style={{ backgroundColor: role.color === '#000000' || !role.color ? '#8b5cf6' : role.color }} 
                                                />
                                                <span className="text-sm font-medium">{role.name}</span>
                                            </div>
                                            {isSelected && <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-[#8b5cf6]" />}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
