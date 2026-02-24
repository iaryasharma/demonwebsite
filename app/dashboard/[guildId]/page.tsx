"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
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
    const [data, setData] = useState<GuildSettings | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/dashboard")
            return
        }
        if (status !== "authenticated") return

        async function fetchSettings() {
            try {
                const res = await fetch(`/api/guilds/${guildId}/settings`)
                if (res.ok) setData(await res.json())
            } catch {
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [guildId, status, router])

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
            desc: "Prefix, language, and core configuration",
            color: "from-[#8b5cf6]/15 to-[#7c3aed]/15",
            borderColor: "border-[#8b5cf6]/20 hover:border-[#8b5cf6]/40",
        },
    ]

    const stats = [
        {
            icon: faTerminal,
            label: "Prefix",
            value: data?.prefix || "!!",
            color: "text-[#a78bfa]",
        },
        {
            icon: faShieldHalved,
            label: "Moderation",
            value: data?.settings?.moderation?.enabled ? "Enabled" : "Disabled",
            color: data?.settings?.moderation?.enabled ? "text-green-400" : "text-gray-500",
        },
        {
            icon: faDoorOpen,
            label: "Welcome",
            value: data?.settings?.welcome?.enabled ? "Enabled" : "Disabled",
            color: data?.settings?.welcome?.enabled ? "text-green-400" : "text-gray-500",
        },
        {
            icon: faChartLine,
            label: "Leveling",
            value: data?.settings?.leveling?.enabled ? "Enabled" : "Disabled",
            color: data?.settings?.leveling?.enabled ? "text-green-400" : "text-gray-500",
        },
    ]

    return (
        <div className="min-h-screen bg-black p-6 lg:p-10">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10"
                >
                    <h1 className="text-3xl font-bold text-white mb-2">Server Overview</h1>
                    <p className="text-gray-500 text-sm">Quick summary of your bot configuration</p>
                </motion.div>

                {/* Stats grid */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i, duration: 0.4 }}
                            className="glass rounded-xl border border-white/[0.06] p-5 text-center"
                        >
                            <FontAwesomeIcon icon={stat.icon} className={`w-5 h-5 mb-3 mx-auto ${stat.color}`} />
                            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                            <p className={`font-semibold ${stat.color}`}>{stat.value}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Quick links */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {quickLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`group glass rounded-xl border ${link.borderColor} p-5 transition-all duration-300 hover:-translate-y-1`}
                            >
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center mb-3`}>
                                    <FontAwesomeIcon icon={link.icon} className="w-4 h-4 text-[#a78bfa]" />
                                </div>
                                <h3 className="text-white font-semibold mb-1 group-hover:text-[#a78bfa] transition-colors">
                                    {link.label}
                                </h3>
                                <p className="text-gray-500 text-sm">{link.desc}</p>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
