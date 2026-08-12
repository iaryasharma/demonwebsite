"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faGear,
    faTerminal,
    faUsers,
    faShieldHalved,
    faSpinner,
    faDoorOpen,
    faChartLine,
    faBullhorn,
    faGift,
    faRightFromBracket,
    faToggleOn,
    faClipboardList,
    faWrench,
    faTicket
} from "@fortawesome/free-solid-svg-icons"

interface GuildSettings {
    guildId: string
    prefix: string
    settings: Record<string, any>
}

export default function GuildOverviewPage() {
    const { data: session, status } = useSession()
    const params = useParams()
    const router = useRouter()
    const guildId = params?.guildId as string
    const { data, isLoading: loading } = useQuery<GuildSettings>({
        queryKey: ["guild-settings", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/settings`)
            if (!res.ok) throw new Error("Failed to fetch settings")
            return res.json()
        },
        enabled: status === "authenticated" && !!guildId,
        staleTime: 300_000, // Keep data fresh for 5 minutes
        refetchOnWindowFocus: false,
    })

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/dashboard")
        }
    }, [status, router])

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-[#8b5cf6] animate-spin" />
            </div>
        )
    }

    const quickLinks = [
        {
            href: `/dashboard/${guildId}/settings`,
            icon: faGear,
            label: "General Settings",
            desc: "Prefix and server configuration",
            color: "from-[#8b5cf6]/15 to-[#7c3aed]/15",
            borderColor: "border-[#8b5cf6]/20 hover:border-[#8b5cf6]/50",
            iconColor: "text-[#a78bfa]"
        },
        {
            href: `/dashboard/${guildId}/modules/welcome`,
            icon: faDoorOpen,
            label: "Welcome Messages",
            desc: "Greet new members when they join safely.",
            color: "from-green-500/15 to-emerald-600/15",
            borderColor: "border-green-500/20 hover:border-green-500/50",
            iconColor: "text-green-400"
        },
        {
            href: `/dashboard/${guildId}/modules/verification`,
            icon: faShieldHalved,
            label: "Verification",
            desc: "Protect your server with a captcha system.",
            color: "from-yellow-500/15 to-orange-600/15",
            borderColor: "border-yellow-500/20 hover:border-yellow-500/50",
            iconColor: "text-yellow-400"
        },
        {
            href: `/dashboard/${guildId}/announce`,
            icon: faBullhorn,
            label: "Announce",
            desc: "Send beautiful embedded messages via webhooks.",
            color: "from-blue-500/15 to-indigo-600/15",
            borderColor: "border-blue-500/20 hover:border-blue-500/50",
            iconColor: "text-blue-400"
        },
        {
            href: `/dashboard/${guildId}/giveaways`,
            icon: faGift,
            label: "Giveaways",
            desc: "Host animated giveaways for your server.",
            color: "from-pink-500/15 to-rose-600/15",
            borderColor: "border-pink-500/20 hover:border-pink-500/50",
            iconColor: "text-pink-400"
        },
        {
            href: `/dashboard/${guildId}/tickets`,
            icon: faTicket,
            label: "Tickets",
            desc: "Manage ticket panels and active support tickets.",
            color: "from-blue-500/15 to-indigo-600/15",
            borderColor: "border-blue-500/20 hover:border-blue-500/50",
            iconColor: "text-blue-400"
        },
        {
            href: `/dashboard/${guildId}/modules/commands`,
            icon: faToggleOn,
            label: "Command State",
            desc: "Selectively manage which channels allow bots.",
            color: "from-cyan-500/15 to-sky-600/15",
            borderColor: "border-cyan-500/20 hover:border-cyan-500/50",
            iconColor: "text-cyan-400"
        },
    ]

    const stats = [
        {
            icon: faTerminal,
            label: "Global Prefix",
            value: data?.prefix || "!!",
            color: "text-[#a78bfa]",
        },
        {
            icon: faUsers,
            label: "Member Tracking",
            value: "Active",
            color: "text-emerald-400",
        },
        {
            icon: faClipboardList,
            label: "Logging Module",
            value: "Integrated",
            color: "text-blue-400",
        }
    ]

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-6xl mx-auto space-y-12 pb-24">
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative rounded-3xl overflow-hidden glass border border-white/10 p-10 mt-4"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#8b5cf6] opacity-10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500 opacity-5 blur-[80px] rounded-full pointer-events-none" />

                    <div className="relative z-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 mb-4">
                            Server Overview
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl">
                            A centralized hub for deploying your bot configurations, tracking active settings, and launching interactive modules across your community.
                        </p>
                    </div>
                </motion.div>

                {/* Stats grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * i, duration: 0.5 }}
                            className="glass rounded-2xl border border-white/[0.08] p-6 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                    <FontAwesomeIcon icon={stat.icon} className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 font-medium mb-1">{stat.label}</p>
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Module quick links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="w-8 h-1 bg-[#8b5cf6] rounded-full inline-block" />
                            Deployed Modules
                        </h2>
                        <Link href={`/dashboard/${guildId}/modules`} className="text-sm font-medium text-[#8b5cf6] hover:text-[#a78bfa] transition-colors">
                            View All Tools &rarr;
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quickLinks.map((link, i) => (
                            <motion.div
                                key={link.href}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 * i }}
                            >
                                <Link
                                    href={link.href}
                                    className={`block h-full group glass rounded-2xl border ${link.borderColor} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden`}
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                                            &rarr;
                                        </div>
                                    </div>
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-5 border border-white/5`}>
                                        <FontAwesomeIcon icon={link.icon} className={`w-6 h-6 ${link.iconColor}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">
                                        {link.label}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{link.desc}</p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Advanced Tools section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="flex items-center mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="w-8 h-1 bg-rose-500 rounded-full inline-block" />
                            Advanced Operations
                        </h2>
                    </div>
                    <Link
                        href={`/dashboard/${guildId}/modules/mmode`}
                        className="group flex flex-col sm:flex-row items-start sm:items-center justify-between glass rounded-2xl border border-rose-500/20 hover:border-rose-500/50 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/10"
                    >
                        <div className="flex items-center gap-6 mb-4 sm:mb-0">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-600/20 border border-rose-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                                <FontAwesomeIcon icon={faWrench} className="w-7 h-7 text-rose-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-rose-400 transition-colors">Server Maintenance Mode</h3>
                                <p className="text-gray-400 text-sm max-w-md">Instantly lock all server channels and redirect members to a single update channel.</p>
                            </div>
                        </div>
                        <div className="px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm transition-colors border border-rose-400/50 flex items-center gap-2">
                            Toggle Status
                        </div>
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}
