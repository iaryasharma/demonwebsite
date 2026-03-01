"use client"

import { useState, useRef } from "react"
import { useSession, signIn } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDiscord } from "@fortawesome/free-brands-svg-icons"
import {
  faMagnifyingGlass,
  faServer,
  faSpinner,
  faRotateRight,
  faCheckCircle,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons"
import { ServerCard } from "@/components/dashboard/server-card"

interface Guild {
  id: string
  name: string
  icon: string | null
  memberCount: number | null
  botPresent: boolean
}

async function fetchGuilds(forceRefresh: boolean): Promise<Guild[]> {
  const url = forceRefresh ? "/api/guilds?refresh=true" : "/api/guilds"
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed to fetch guilds (${res.status})`)
  return res.json()
}

export default function DashboardPage() {
  const { status } = useSession()
  const [search, setSearch] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const forceRefreshRef = useRef(false)

  const {
    data: guilds = [],
    isLoading: loading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useQuery<Guild[]>({
    queryKey: ["guilds"],
    queryFn: () => fetchGuilds(forceRefreshRef.current),
    enabled: status === "authenticated",
    // Always re-fetch on mount and when the window regains focus
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
  })

  const handleRefresh = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    forceRefreshRef.current = true
    try {
      await refetch()
    } finally {
      forceRefreshRef.current = false
      setIsRefreshing(false)
    }
  }

  // â”€â”€ Auth Guards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Derived state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const query = search.toLowerCase()
  const filtered = guilds.filter((g) => g.name.toLowerCase().includes(query))
  const withBot = filtered.filter((g) => g.botPresent)
  const withoutBot = filtered.filter((g) => !g.botPresent)

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null

  // â”€â”€ Main Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center border border-[#8b5cf6]/20">
              <FontAwesomeIcon icon={faServer} className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-gray-400 text-base">
              Manage your Discord communities and bot settings.
            </p>
            {!loading && guilds.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-emerald-400/80">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
                  {guilds.filter(g => g.botPresent).length} active
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <FontAwesomeIcon icon={faCircleExclamation} className="w-3 h-3" />
                  {guilds.filter(g => !g.botPresent).length} without bot
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Search + Refresh bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 flex flex-col sm:flex-row gap-4 items-center justify-between p-4 glass rounded-2xl border border-white/[0.04]"
        >
          <div className="relative w-full max-w-md">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search servers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/[0.03] rounded-xl border border-white/[0.06] focus:border-[#8b5cf6]/25 focus:ring-2 focus:ring-[#8b5cf6]/10 focus:outline-none text-white placeholder-gray-500 text-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {lastUpdated && !loading && (
              <span className="text-[11px] text-gray-600 whitespace-nowrap hidden sm:block">
                Updated {lastUpdated}
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 rounded-xl border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/40 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <FontAwesomeIcon
                icon={isRefreshing ? faSpinner : faRotateRight}
                className={`w-3.5 h-3.5 text-[#8b5cf6] ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}
              />
              <span className="text-sm font-semibold whitespace-nowrap">
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[220px] glass rounded-2xl border border-white/[0.06] animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center glass rounded-3xl border border-red-500/10"
          >
            <FontAwesomeIcon icon={faCircleExclamation} className="w-8 h-8 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load servers</h3>
            <p className="text-gray-400 mb-6">There was a problem fetching your server list.</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2.5 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-white text-sm font-semibold hover:bg-[#8b5cf6]/20 transition-all"
            >
              Try again
            </button>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center glass rounded-3xl border border-white/[0.06]"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className="w-8 h-8 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No servers found</h3>
            <p className="text-gray-400">
              {search
                ? "Try a different search term."
                : "You don't manage any Discord servers, or your session needs refreshing."}
            </p>
            {!search && (
              <button
                onClick={handleRefresh}
                className="mt-6 px-6 py-2.5 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-white text-sm font-semibold hover:bg-[#8b5cf6]/20 transition-all"
              >
                Refresh
              </button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>

            {/* â”€â”€ Servers with bot â”€â”€ */}
            {withBot.length > 0 && (
              <motion.section
                key="with-bot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-6 px-1">
                  <span className="flex items-center justify-center px-2.5 py-0.5 rounded bg-[#8b5cf6]/20 text-[#8b5cf6] text-[10px] font-bold uppercase tracking-wider border border-[#8b5cf6]/30">
                    Active
                  </span>
                  <h2 className="text-lg font-bold text-white tracking-tight">Bot Active</h2>
                  <span className="text-gray-500 text-sm font-medium ml-1 opacity-60">
                    ({withBot.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {withBot.map((guild) => (
                    <ServerCard
                      key={guild.id}
                      id={guild.id}
                      name={guild.name}
                      icon={guild.icon}
                      memberCount={guild.memberCount}
                      botPresent={true}
                    />
                  ))}
                </div>
              </motion.section>
            )}

            {/* â”€â”€ Servers without bot â”€â”€ */}
            {withoutBot.length > 0 && (
              <motion.section
                key="without-bot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="flex items-center gap-3 mb-6 px-1">
                  <span className="flex items-center justify-center px-2.5 py-0.5 rounded bg-white/[0.05] text-gray-400 text-[10px] font-bold uppercase tracking-wider border border-white/[0.08]">
                    Invite
                  </span>
                  <h2 className="text-lg font-bold text-white tracking-tight opacity-70">
                    Add Bot
                  </h2>
                  <span className="text-gray-500 text-sm font-medium ml-1 opacity-40">
                    ({withoutBot.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {withoutBot.map((guild) => (
                    <ServerCard
                      key={guild.id}
                      id={guild.id}
                      name={guild.name}
                      icon={guild.icon}
                      memberCount={guild.memberCount}
                      botPresent={false}
                    />
                  ))}
                </div>
              </motion.section>
            )}

          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
