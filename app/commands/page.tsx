"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faMagnifyingGlass,
  faCopy,
  faCheck,
  faHashtag,
  faSlash,
  faChevronDown,
  faChevronRight,
  faClock,
  faShieldHalved,
  faBolt,
  faTerminal,
  faServer,
  faTag,
  faArrowUp,
  faCodeBranch,
  faImage,
  faSmile,
  faGift,
  faComments,
  faVolumeUp,
  faDoorOpen,
} from "@fortawesome/free-solid-svg-icons"

import rawData from "@/json/commands_list.json"

// ── Types ────────────────────────────────────────────────────────────────────
interface SubcommandOption {
  name: string
  description: string
  type: string
  required: boolean
}

interface Subcommand {
  name: string
  description: string
  options?: SubcommandOption[]
}

interface Command {
  name: string
  description: string
  usage: string
  category: string
  type: "slash+prefix" | "prefix-only" | "slash-only"
  cooldown: number
  guildOnly: boolean
  aliases: string[]
  userPermissions: string[]
  botPermissions: string[]
  hasSubcommands: boolean
  subcommands: Subcommand[]
  file: string
}

interface CommandsData {
  generated: string
  excludedCategories: string[]
  summary: {
    totalCommands: number
    byType: { slashAndPrefix: number; slashOnly: number; prefixOnly: number }
    withSubcommands: number
    categories: string[]
  }
  categories: Record<string, Command[]>
}

// ── Constants ─────────────────────────────────────────────────────────────────
const DEFAULT_PREFIX = process.env.NEXT_PUBLIC_DEFAULT_PREFIX || "!!"

const categoryIcons: Record<string, typeof faBolt> = {
  announcement: faComments,
  information: faTag,
  settings: faTerminal,
  moderator: faShieldHalved,
  support: faServer,
  voicemod: faVolumeUp,
  fun: faSmile,
  action: faSmile,
  giveaway: faGift,
  image: faImage,
  utility: faBolt,
  welcome: faDoorOpen,
}

const categoryColors: Record<string, string> = {
  announcement: "from-blue-500/15 to-blue-700/15",
  information: "from-cyan-500/15 to-cyan-700/15",
  settings: "from-gray-500/15 to-gray-700/15",
  moderator: "from-red-500/15 to-red-700/15",
  support: "from-green-500/15 to-green-700/15",
  voicemod: "from-yellow-500/15 to-yellow-700/15",
  fun: "from-pink-500/15 to-pink-700/15",
  action: "from-pink-500/15 to-rose-700/15",
  giveaway: "from-amber-500/15 to-amber-700/15",
  image: "from-purple-500/15 to-indigo-700/15",
  utility: "from-indigo-500/15 to-indigo-700/15",
  welcome: "from-emerald-500/15 to-emerald-700/15",
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CommandsPage() {
  const data = rawData as unknown as CommandsData
  const allCategories = Object.keys(data.categories).filter(c => c !== "developer")
  const allCommandsList: Command[] = allCategories.flatMap(cat => data.categories[cat] ?? [])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedCommands, setExpandedCommands] = useState<Set<string>>(new Set())
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Ctrl+K / "/" focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === "k") || (e.key === "/" && document.activeElement?.tagName !== "INPUT")) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Scroll-to-top button
  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  const toggleExpansion = (name: string) => {
    const next = new Set(expandedCommands)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    setExpandedCommands(next)
  }

  const copyCommand = async (name: string, isSlash: boolean) => {
    const text = isSlash ? `/${name}` : `${DEFAULT_PREFIX}${name}`
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCommand(text)
      setTimeout(() => setCopiedCommand(null), 2000)
    } catch { }
  }

  // Filter
  const filteredByCategory: Record<string, Command[]> = {}
  allCategories.forEach(cat => {
    if (selectedCategory && cat !== selectedCategory) return
    const cmds = (data.categories[cat] ?? []).filter(cmd => {
      if (!searchTerm) return true
      const q = searchTerm.toLowerCase()
      return (
        cmd.name.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.aliases.some(a => a.toLowerCase().includes(q)) ||
        cmd.subcommands.some(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      )
    })
    if (cmds.length > 0) filteredByCategory[cat] = cmds
  })

  const totalFiltered = Object.values(filteredByCategory).reduce((a, b) => a + b.length, 0)

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background video */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          autoPlay loop muted playsInline preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          style={{ minWidth: "100%", minHeight: "100%", width: "auto", height: "auto", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        >
          <source src="/sky.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-center mb-14"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-5 bg-gradient-to-r from-white via-[#a78bfa] to-white bg-clip-text text-transparent">
              Commands
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
              Discover the full power of{" "}
              <span className="text-[#a78bfa] font-semibold">Demon Bot</span> with our comprehensive command library
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white">{data.summary.totalCommands}</span>
                <span className="text-xs text-gray-500">Total Commands</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-400">{data.summary.byType.slashAndPrefix}</span>
                <span className="text-xs text-gray-500">Slash + Prefix</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-orange-400">{data.summary.byType.prefixOnly}</span>
                <span className="text-xs text-gray-500">Prefix Only</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-emerald-400">{data.summary.withSubcommands}</span>
                <span className="text-xs text-gray-500">With Subcommands</span>
              </div>
            </div>

            {/* Command type legend */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 glass rounded-full text-sm font-medium text-blue-300 border border-blue-500/20">
                <FontAwesomeIcon icon={faSlash} className="w-3.5 h-3.5" />
                Slash Commands
              </span>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 glass rounded-full text-sm font-medium text-orange-300 border border-orange-500/20">
                <FontAwesomeIcon icon={faHashtag} className="w-3.5 h-3.5" />
                Prefix Commands
              </span>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 glass rounded-full text-sm font-medium text-emerald-300 border border-emerald-500/20">
                <FontAwesomeIcon icon={faCodeBranch} className="w-3.5 h-3.5" />
                Subcommands
              </span>
            </div>
          </motion.div>

          {/* ── Search & Filters ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-12 space-y-6"
          >
            {/* Search */}
            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8b5cf6]/20 to-[#7c3aed]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative glass rounded-2xl p-1 border border-white/[0.06] hover:border-[#8b5cf6]/25 transition-colors duration-300">
                <div className="relative">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search commands, aliases, subcommands…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-24 h-14 bg-transparent border-0 focus:ring-2 focus:ring-[#8b5cf6]/20 focus:outline-none text-white placeholder-gray-500 text-base rounded-2xl transition-all"
                  />
                  <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-[11px] text-gray-500 font-mono">
                    Ctrl K
                  </kbd>
                </div>
              </div>
            </div>

            {/* Category pills */}
            <div className="flex gap-2.5 flex-wrap justify-center">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${selectedCategory === null
                  ? "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-lg shadow-[#8b5cf6]/20"
                  : "glass border border-white/[0.06] text-gray-400 hover:text-white hover:border-[#8b5cf6]/25"
                  }`}
              >
                All ({allCommandsList.length})
              </motion.button>
              {allCategories.map(cat => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-6 py-2.5 text-sm font-semibold capitalize transition-all duration-300 ${selectedCategory === cat
                    ? "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-lg shadow-[#8b5cf6]/20"
                    : "glass border border-white/[0.06] text-gray-400 hover:text-white hover:border-[#8b5cf6]/25"
                    }`}
                >
                  {cat.replace(/_/g, " ")}
                  <span className="ml-2 text-xs opacity-60">({data.categories[cat]?.length ?? 0})</span>
                </motion.button>
              ))}
            </div>

            {searchTerm && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-gray-500">
                {totalFiltered} command{totalFiltered !== 1 ? "s" : ""} found
              </motion.p>
            )}
          </motion.div>

          {/* ── Commands List ── */}
          <div className="space-y-14">
            {Object.entries(filteredByCategory).map(([category, commands]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                className="space-y-5"
              >
                {/* Category header */}
                <div className="flex items-center flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${categoryColors[category] ?? "from-[#8b5cf6]/15 to-[#7c3aed]/15"} flex items-center justify-center`}>
                      <FontAwesomeIcon icon={categoryIcons[category] ?? faBolt} className="w-4 h-4 text-[#a78bfa]" />
                    </div>
                    <h2 className="text-2xl font-bold text-white capitalize">{category.replace(/_/g, " ")}</h2>
                    <span className="text-xs font-medium text-gray-500 bg-white/[0.04] px-2.5 py-1 rounded-full">
                      {commands.length}
                    </span>
                  </div>

                  <div className="flex gap-2 ml-auto">
                    {commands.some(c => c.type === "slash+prefix") && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                        <FontAwesomeIcon icon={faSlash} className="w-3 h-3" />
                        Slash
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
                      <FontAwesomeIcon icon={faHashtag} className="w-3 h-3" />
                      Prefix
                    </span>
                  </div>
                </div>

                {/* Commands grid */}
                <motion.div
                  variants={containerVariants} initial="hidden"
                  whileInView="visible" viewport={{ once: true, margin: "-40px" }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {commands.map(command => {
                    const isSlashPrefix = command.type === "slash+prefix"
                    const isExpanded = expandedCommands.has(command.name)
                    const slashCopy = `/${command.name}`
                    const prefixCopy = `${DEFAULT_PREFIX}${command.name}`

                    return (
                      <motion.div key={command.name} variants={cardVariants} layout className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                        <div className="relative glass rounded-xl border border-white/[0.06] hover:border-[#8b5cf6]/20 transition-all duration-300 overflow-hidden h-full flex flex-col">

                          {/* Card header */}
                          <button
                            onClick={() => toggleExpansion(command.name)}
                            className="w-full text-left p-5 hover:bg-white/[0.02] transition-colors duration-200 flex-1"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <FontAwesomeIcon icon={faBolt} className="w-3.5 h-3.5 text-[#8b5cf6] shrink-0" />
                                <h3 className="text-[#a78bfa] font-mono text-base font-semibold group-hover:text-white transition-colors truncate">
                                  {command.name}
                                </h3>
                              </div>
                              <div className="flex items-center gap-1.5 ml-2 shrink-0">
                                {isSlashPrefix && (
                                  <span title="Slash + Prefix">
                                    <FontAwesomeIcon icon={faSlash} className="w-3 h-3 text-blue-400/60" />
                                  </span>
                                )}
                                {command.hasSubcommands && (
                                  <span title="Has subcommands">
                                    <FontAwesomeIcon icon={faCodeBranch} className="w-3 h-3 text-emerald-400/60" />
                                  </span>
                                )}
                                <FontAwesomeIcon
                                  icon={isExpanded ? faChevronDown : faChevronRight}
                                  className="w-3 h-3 text-gray-600 transition-transform"
                                />
                              </div>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                              {command.description}
                            </p>
                            {/* Type badge */}
                            <div className="mt-3 flex gap-1.5 flex-wrap">
                              {isSlashPrefix ? (
                                <span className="text-[10px] font-medium text-blue-300 bg-blue-500/10 border border-blue-500/15 px-2 py-0.5 rounded-full">Slash + Prefix</span>
                              ) : (
                                <span className="text-[10px] font-medium text-orange-300 bg-orange-500/10 border border-orange-500/15 px-2 py-0.5 rounded-full">Prefix Only</span>
                              )}
                              {command.hasSubcommands && (
                                <span className="text-[10px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-full">
                                  {command.subcommands.length} subcommands
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Expanded details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
                                className="overflow-hidden"
                              >
                                <div className="px-5 pb-5 space-y-4 border-t border-white/[0.04] pt-4">

                                  {/* Usage */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                      <FontAwesomeIcon icon={faTerminal} className="w-3 h-3" />
                                      Usage
                                    </h4>
                                    <div className="bg-black/40 rounded-lg p-3 font-mono text-xs border border-white/[0.04]">
                                      <span className="text-[#a78bfa]">{command.usage}</span>
                                    </div>
                                  </div>

                                  {/* Subcommands */}
                                  {command.hasSubcommands && command.subcommands.length > 0 && (
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                        <FontAwesomeIcon icon={faCodeBranch} className="w-3 h-3" />
                                        Subcommands
                                      </h4>
                                      <div className="space-y-1.5">
                                        {command.subcommands.map(sub => (
                                          <div key={sub.name} className="flex items-start gap-2 bg-black/30 rounded-lg p-2.5 border border-white/[0.04]">
                                            <span className="font-mono text-xs text-emerald-400 shrink-0 mt-0.5">{sub.name}</span>
                                            <span className="text-xs text-gray-500 leading-relaxed">{sub.description}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Copy buttons */}
                                  <div className="flex gap-2">
                                    {isSlashPrefix && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); copyCommand(command.name, true) }}
                                        className="flex-1 flex items-center justify-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-blue-500/20 text-blue-300 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all"
                                      >
                                        <FontAwesomeIcon icon={copiedCommand === slashCopy ? faCheck : faSlash} className="w-3 h-3" />
                                        {copiedCommand === slashCopy ? "Copied!" : "Copy Slash"}
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); copyCommand(command.name, false) }}
                                      className="flex-1 flex items-center justify-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-white/[0.06] text-gray-400 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all"
                                    >
                                      <FontAwesomeIcon icon={copiedCommand === prefixCopy ? faCheck : faCopy} className="w-3 h-3" />
                                      {copiedCommand === prefixCopy ? "Copied!" : "Copy Prefix"}
                                    </button>
                                  </div>

                                  {/* Aliases */}
                                  {command.aliases.length > 0 && (
                                    <div>
                                      <span className="text-xs text-gray-500 font-medium">Aliases</span>
                                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {command.aliases.map(alias => (
                                          <span key={alias} className="text-[11px] font-mono bg-white/[0.04] text-gray-400 px-2 py-0.5 rounded-md border border-white/[0.04]">
                                            {alias}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Cooldown */}
                                  {command.cooldown > 0 && (
                                    <div className="flex items-center gap-2">
                                      <FontAwesomeIcon icon={faClock} className="w-3 h-3 text-orange-400/70" />
                                      <span className="text-xs text-gray-500">Cooldown:</span>
                                      <span className="text-[11px] font-mono text-orange-300 bg-orange-500/10 border border-orange-500/15 px-2 py-0.5 rounded-md">
                                        {command.cooldown}s
                                      </span>
                                    </div>
                                  )}

                                  {/* Required permissions */}
                                  {command.userPermissions.length > 0 && (
                                    <div>
                                      <div className="flex items-center gap-1.5 mb-1.5">
                                        <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 text-red-400/70" />
                                        <span className="text-xs text-gray-500 font-medium">Required Permissions</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {command.userPermissions.map(perm => (
                                          <span key={perm} className="text-[11px] bg-red-500/10 text-red-300 border border-red-500/15 px-2 py-0.5 rounded-md">
                                            {perm.replace(/_/g, " ")}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Footer */}
                                  <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                                    {command.guildOnly && (
                                      <span className="text-[11px] font-medium text-purple-300 bg-purple-500/10 border border-purple-500/15 px-2 py-0.5 rounded-md">
                                        <FontAwesomeIcon icon={faServer} className="w-2.5 h-2.5 mr-1" />
                                        Server Only
                                      </span>
                                    )}
                                    <span className="text-[11px] text-gray-600 capitalize ml-auto">{command.category}</span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Empty state */}
          {Object.keys(filteredByCategory).length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                <FontAwesomeIcon icon={faTerminal} className="w-9 h-9 text-gray-700" />
              </div>
              <p className="text-gray-400 text-lg mb-2">No commands found</p>
              <p className="text-gray-600 text-sm">Try adjusting your search terms or category filter.</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll-to-top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 z-50 w-11 h-11 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-white shadow-lg shadow-[#8b5cf6]/20 flex items-center justify-center hover:shadow-[#8b5cf6]/30 transition-shadow"
          >
            <FontAwesomeIcon icon={faArrowUp} className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}