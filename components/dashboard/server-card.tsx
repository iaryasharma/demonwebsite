"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGear, faPlus, faUserGroup } from "@fortawesome/free-solid-svg-icons"

interface ServerCardProps {
    id: string
    name: string
    icon: string | null
    memberCount: number | null
    botPresent?: boolean
}

const BOT_INVITE_URL =
    "https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20applications.commands&permissions=1513962695871"

export function ServerCard({ id, name, icon, memberCount, botPresent = true }: ServerCardProps) {
    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="group relative h-full"
        >
            {/* Soft highlight/glow for active servers */}
            {botPresent && (
                <div className="absolute -inset-[1px] bg-gradient-to-br from-[#8b5cf6]/20 to-transparent rounded-[21px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}

            <div className={`relative h-full glass rounded-[20px] border border-white/[0.06] group-hover:border-[#8b5cf6]/20 transition-all duration-300 p-6 flex flex-col ${!botPresent ? "opacity-70" : ""}`}>
                <div className="flex items-start gap-5 mb-6">
                    {/* Server icon with premium frame */}
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-white/[0.04] border border-white/[0.06] group-hover:border-[#8b5cf6]/30 transition-colors">
                        {icon ? (
                            <Image
                                src={icon}
                                alt={name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-black text-gray-400 bg-gradient-to-br from-gray-800 to-gray-900">
                                {name.charAt(0)}
                            </div>
                        )}
                        {/* Status indicator badge */}
                        <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-black ${botPresent ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </div>

                    <div className="min-w-0 pt-1">
                        <h3 className="text-white text-lg font-bold truncate leading-tight group-hover:text-[#a78bfa] transition-colors">
                            {name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-gray-500 font-medium tracking-tight">
                            <FontAwesomeIcon icon={faUserGroup} className="w-3 h-3 opacity-60" />
                            <span className="text-sm">
                                {memberCount ? `${memberCount.toLocaleString()}` : '0'} members
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-2">
                    {botPresent ? (
                        <Link
                            href={`/dashboard/${id}`}
                            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white text-sm font-bold shadow-lg shadow-[#8b5cf6]/10 hover:shadow-[#8b5cf6]/20 hover:scale-[1.02] transition-all duration-300"
                        >
                            <FontAwesomeIcon icon={faGear} className="w-3.5 h-3.5" />
                            Manage Server
                        </Link>
                    ) : (
                        <a
                            href={`${BOT_INVITE_URL}&guild_id=${id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-[#8b5cf6]/30 text-white text-sm font-bold transition-all duration-300 group/btn"
                        >
                            <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5 text-[#8b5cf6] group-hover/btn:rotate-90 transition-transform duration-300" />
                            Invite Bot
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
