"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGear, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons"

interface ServerCardProps {
    id: string
    name: string
    icon: string | null
    memberCount: number | null
    botPresent?: boolean
}

const BOT_INVITE_URL =
    "https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20identify%20guilds%20applications.commands&response_type=code&permissions=1513962695871&state=QGn-6VzBYf2Ta8nMk_tFe"

export function ServerCard({ id, name, icon, memberCount, botPresent = true }: ServerCardProps) {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="group relative"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
            <div className="relative glass rounded-2xl border border-white/[0.06] hover:border-[#8b5cf6]/20 transition-all duration-300 p-5">
                <div className="flex items-center gap-4 mb-4">
                    {/* Server icon */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white/[0.06]">
                        {icon ? (
                            <Image
                                src={icon}
                                alt={name}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400 bg-gradient-to-br from-gray-800 to-gray-900">
                                {name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-white font-semibold truncate group-hover:text-[#a78bfa] transition-colors">
                            {name}
                        </h3>
                        {memberCount && (
                            <p className="text-xs text-gray-500">{memberCount.toLocaleString()} members</p>
                        )}
                    </div>
                </div>

                {botPresent ? (
                    <Link
                        href={`/dashboard/${id}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#8b5cf6]/20 transition-all duration-300"
                    >
                        <FontAwesomeIcon icon={faGear} className="w-3.5 h-3.5" />
                        Manage
                    </Link>
                ) : (
                    <a
                        href={`${BOT_INVITE_URL}&guild_id=${id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#8b5cf6]/30 text-[#a78bfa] text-sm font-semibold hover:bg-[#8b5cf6]/10 transition-all duration-300"
                    >
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-3.5 h-3.5" />
                        Invite Bot
                    </a>
                )}
            </div>
        </motion.div>
    )
}
