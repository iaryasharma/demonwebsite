"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faGaugeHigh,
    faGear,
    faShieldHalved,
    faDoorOpen,
    faChartLine,
    faChevronLeft,
    faChevronRight,
    faArrowRightFromBracket,
    faHouse,
    faBars,
    faXmark,
    faBullhorn,
    faGift,
    faTicket,
} from "@fortawesome/free-solid-svg-icons"

interface SidebarProps {
    guildId?: string
    guildName?: string
    guildIcon?: string | null
    collapsed: boolean
    onToggleCollapse: () => void
}

import { faCubes } from "@fortawesome/free-solid-svg-icons"

const sidebarLinks = (guildId: string) => [
    { href: `/dashboard/${guildId}`, label: "Overview", icon: faGaugeHigh },
    { href: `/dashboard/${guildId}/modules`, label: "Modules", icon: faCubes },
    { href: `/dashboard/${guildId}/announce`, label: "Announce", icon: faBullhorn },
    { href: `/dashboard/${guildId}/giveaways`, label: "Giveaways", icon: faGift },
    { href: `/dashboard/${guildId}/tickets`, label: "Tickets", icon: faTicket },
    { href: `/dashboard/${guildId}/settings`, label: "Settings", icon: faGear },
]

export function DashboardSidebar({ guildId, guildName, guildIcon, collapsed, onToggleCollapse }: SidebarProps) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const pathname = usePathname()
    const { data: session } = useSession()
    const user = session?.user

    const links = guildId ? sidebarLinks(guildId) : []

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="h-16 flex items-center px-4 border-b border-white/[0.06]">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={faHouse} className="w-4 h-4 text-white" />
                    </div>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-semibold text-white group-hover:text-[#a78bfa] transition-colors truncate"
                        >
                            Dashboard
                        </motion.span>
                    )}
                </Link>
            </div>

            {/* Guild info */}
            {guildId && guildName && (
                <div className="p-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-white/[0.06]">
                            {guildIcon ? (
                                <Image src={guildIcon} alt={guildName} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-400">
                                    {guildName.charAt(0)}
                                </div>
                            )}
                        </div>
                        {!collapsed && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{guildName}</p>
                                <p className="text-[11px] text-gray-500 truncate">{guildId}</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}

            {/* Nav links */}
            <nav className="flex-1 p-3 space-y-1">
                {links.map((link) => {
                    const isActive = pathname === link.href
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-[#8b5cf6]/15 text-[#a78bfa] border border-[#8b5cf6]/20"
                                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                                }`}
                        >
                            <FontAwesomeIcon icon={link.icon} className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#8b5cf6]" : ""}`} />
                            {!collapsed && <span>{link.label}</span>}
                        </Link>
                    )
                })}
            </nav>



            {/* Collapse toggle (desktop only) */}
            <div className="hidden lg:block p-3 border-t border-white/[0.06]">
                <button
                    onClick={onToggleCollapse}
                    className="flex items-center justify-center w-full py-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all"
                >
                    <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-3 left-4 z-50 w-10 h-10 rounded-lg glass border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
                <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} className="w-4 h-4" />
            </button>

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full z-40 bg-gray-950/95 backdrop-blur-xl border-r border-white/[0.06] transition-all duration-300 ${collapsed ? "w-[72px]" : "w-64"
                    } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                {sidebarContent}
            </aside>
        </>
    )
}
