"use client"

import { ServerCard } from "@/components/dashboard/server-card" // Not used, but needed for the layout logic later? No, wait.
// Actually this is the page for modules directory.
import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faDoorOpen,
    faRightFromBracket,
    faClipboardList,
    faUserTag,
    faShieldHalved,
    faGear,
    faCubes,
    faTerminal,
    faToggleOn,
    faWrench,
    faTicket,
} from "@fortawesome/free-solid-svg-icons"

const MODULES = [
    {
        id: "welcome",
        name: "Welcome",
        description: "Greet new members when they join safely.",
        icon: faDoorOpen,
        color: "from-green-500 to-emerald-600",
        href: "welcome", // relative to /dashboard/[guildId]/modules
    },
    {
        id: "leave",
        name: "Leave",
        description: "Say goodbye to members when they leave.",
        icon: faRightFromBracket,
        color: "from-red-500 to-rose-600",
        href: "leave",
    },
    {
        id: "logging",
        name: "Logging",
        description: "Keep track of server events and actions.",
        icon: faClipboardList,
        color: "from-blue-500 to-indigo-600",
        href: "logging",
    },
    {
        id: "autorole",
        name: "Autorole",
        description: "Automatically assign roles to new members.",
        icon: faUserTag,
        color: "from-purple-500 to-violet-600",
        href: "autorole",
    },
    {
        id: "verification",
        name: "Verification",
        description: "Protect your server with a captcha system.",
        icon: faShieldHalved,
        color: "from-yellow-500 to-orange-600",
        href: "verification",
    },
    {
        id: "prefix",
        name: "Custom Prefix",
        description: "Set a custom trigger prefix for the bot in your server.",
        icon: faTerminal,
        color: "from-pink-500 to-rose-600",
        href: "prefix",
    },
    {
        id: "commands",
        name: "Command State",
        description: "Enable or disable bot commands in specific channels.",
        icon: faToggleOn,
        color: "from-cyan-500 to-blue-600",
        href: "commands",
    },
    {
        id: "tickets",
        name: "Tickets",
        description: "Create and manage ticket panels for support systems.",
        icon: faTicket,
        color: "from-blue-500 to-indigo-600",
        href: "tickets",
    },
    {
        id: "mmode",
        name: "Maintenance Mode",
        description: "Lock channels and set the server to maintenance mode.",
        icon: faWrench,
        color: "from-slate-500 to-gray-600",
        href: "mmode",
    },
]

export default function ModulesPage({
    params,
}: {
    params: Promise<{ guildId: string }>
}) {
    const { data: session } = useSession()

    // In Next.js 15, params is a Promise, so we must `use` it
    const { guildId } = React.use(params)

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-8"
            >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#8b5cf6]/20">
                    <FontAwesomeIcon icon={faCubes} className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Modules</h1>
                    <p className="text-gray-400 mt-1">
                        Configure and manage features for your server.
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MODULES.map((mod, i) => (
                    <motion.div
                        key={mod.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group glass rounded-2xl border border-white/[0.06] hover:border-[#8b5cf6]/30 transition-all p-6 relative overflow-hidden flex flex-col h-full"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${mod.color} opacity-5 blur-3xl rounded-full group-hover:opacity-10 transition-opacity`} />

                        <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center shadow-lg`}>
                                <FontAwesomeIcon icon={mod.icon} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{mod.name}</h3>
                                {/* We'll just show status inside the specific config or load it all here later */}
                            </div>
                        </div>

                        <p className="text-gray-400 text-sm flex-grow mb-6">{mod.description}</p>

                        <Link
                            href={`/dashboard/${guildId}/modules/${mod.href}`}
                            className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white text-sm font-semibold transition-all border border-white/[0.05]"
                        >
                            <FontAwesomeIcon icon={faGear} className="w-4 h-4" />
                            Configure
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
