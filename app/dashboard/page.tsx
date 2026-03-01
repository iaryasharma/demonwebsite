"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDiscord } from "@fortawesome/free-brands-svg-icons"
import {
  faMagnifyingGlass,
  faServer,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons"
import { ServerCard } from "@/components/dashboard/server-card"

interface Guild {
  id: string
  name: string
  icon: string | null
  memberCount: number | null
  botPresent?: boolean
}

export default function DashboardPage() {
  const { status } = useSession()
  const [search, setSearch] = useState("")

  const { data: guilds = [], isLoading: loading } = useQuery<Guild[]>({
    queryKey: ["guilds"],
    queryFn: async () => {
      const res = await fetch("/api/guilds")
      if (!res.ok) throw new Error("Failed to fetch guilds")
      return res.json()
    },
    enabled: status === "authenticated",
  })

  const filtered = guilds
    .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      // Sort by botPresent: true first
      if (a.botPresent === b.botPresent) return 0
      return a.botPresent ? -1 : 1
    })

  // ── Not authenticated: Login screen ──
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#8b5cf6] animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4">
        {/* Background accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#8b5cf6]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-[#5865F2]/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-md w-full"
        >
          <div className="glass rounded-2xl border border-white/[0.06] p-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#5865F2] to-[#4752C4] flex items-center justify-center shadow-lg shadow-[#5865F2]/20">
              <FontAwesomeIcon icon={faDiscord} className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Welcome Back</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Sign in with your Discord account to manage your servers and configure Demon Bot.
            </p>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => signIn("discord")}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#5865F2] to-[#4752C4] text-white font-semibold text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-[#5865F2]/25 transition-shadow"
            >
              <FontAwesomeIcon icon={faDiscord} className="w-5 h-5" />
              Continue with Discord
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Authenticated: Server Picker ──
  return (
    <div className="min-h-screen bg-black p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Your Servers</h1>
          <p className="text-gray-500">
            Select a server to manage Demon Bot settings and configuration.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-md">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search servers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 glass rounded-xl border border-white/[0.06] focus:border-[#8b5cf6]/25 focus:ring-2 focus:ring-[#8b5cf6]/10 focus:outline-none text-white placeholder-gray-500 text-sm transition-all"
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-[#8b5cf6] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
              <FontAwesomeIcon icon={faServer} className="w-7 h-7 text-gray-700" />
            </div>
            <p className="text-gray-400">No servers found</p>
            <p className="text-gray-600 text-sm mt-1">
              {search ? "Try a different search term" : "You need Manage Server permission to see servers here"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((guild, i) => (
              <motion.div
                key={guild.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
              >
                <ServerCard
                  id={guild.id}
                  name={guild.name}
                  icon={guild.icon}
                  memberCount={guild.memberCount}
                  botPresent={guild.botPresent ?? false}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
