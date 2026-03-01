"use client"

import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons"
import { motion } from "framer-motion"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardNavbar() {
    const { data: session } = useSession()
    const user = session?.user

    if (!user) return null

    return (
        <nav className="h-16 border-b border-white/[0.06] bg-gray-950/95 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-end sticky top-0 z-30">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 hover:bg-white/[0.04] p-1.5 rounded-full transition-colors focus:outline-none">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-sm font-medium text-white">{user.name}</span>
                            <span className="text-[11px] text-gray-400">Manage Account</span>
                        </div>
                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white/[0.06] border border-white/[0.1] shadow-sm">
                            {user.image ? (
                                <Image src={user.image} alt={user.name || "User"} width={36} height={36} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[#8b5cf6]/20 flex items-center justify-center text-sm font-bold text-[#a78bfa]">
                                    {user.name?.charAt(0) || <FontAwesomeIcon icon={faUser} />}
                                </div>
                            )}
                        </div>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-900 border border-white/[0.1] text-gray-200 mt-2">
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                            <p className="text-xs leading-none text-gray-400">Admin Account</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/[0.06]" />
                    <DropdownMenuItem
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer focus:bg-red-500/10 focus:text-red-300"
                        onClick={() => signOut({ callbackUrl: "/" })}
                    >
                        <FontAwesomeIcon icon={faArrowRightFromBracket} className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    )
}
