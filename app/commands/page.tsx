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
} from "@fortawesome/free-solid-svg-icons"

import commandsData from "@/json/commands_list.json"

interface Command {
  file: string
  name: string
  description: string
  usage: string
  category: string
  cooldown: number
  userPermissions: string[]
  botPermissions: string[]
  aliases: string[]
  guildOnly: boolean
}

const SLASH_CATEGORIES = ['announcement', 'information', 'settings', 'moderator', 'support', 'voicemod']
const DEFAULT_PREFIX = process.env.NEXT_PUBLIC_DEFAULT_PREFIX || '!!'

const categoryIcons: Record<string, typeof faBolt> = {
  announcement: faServer,
  information: faTag,
  settings: faTerminal,
  moderator: faShieldHalved,
  support: faServer,
  voicemod: faBolt,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export default function CommandsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)
  const [expandedCommands, setExpandedCommands] = useState<Set<string>>(new Set())
  const [showScrollTop, setShowScrollTop] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: Ctrl+K or / to focus search
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

  // Show scroll-to-top button
  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  // Prevent image downloads
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (e.target instanceof HTMLImageElement) e.preventDefault()
    }
    const handleDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement) e.preventDefault()
    }
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("dragstart", handleDragStart)
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("dragstart", handleDragStart)
    }
  }, [])

  const commands: Command[] = commandsData as Command[]
  const categories = Array.from(new Set(commands.map((cmd) => cmd.category))).sort()

  const toggleCommandExpansion = (commandName: string) => {
    const next = new Set(expandedCommands)
    if (next.has(commandName)) next.delete(commandName)
    else next.add(commandName)
    setExpandedCommands(next)
  }

  const filteredCommands = commands.filter((cmd) => {
    const matchesSearch =
      !searchTerm ||
      cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.aliases.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !selectedCategory || cmd.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const groupedCommands = categories.reduce(
    (acc, category) => {
      const cc = filteredCommands.filter((c) => c.category === category)
      if (cc.length > 0) acc[category] = cc
      return acc
    },
    {} as Record<string, Command[]>
  )

  const copyCommand = async (commandName: string, isSlash: boolean) => {
    const text = isSlash ? `/${commandName}` : `${DEFAULT_PREFIX}${commandName}`
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCommand(text)
      setTimeout(() => setCopiedCommand(null), 2000)
    } catch { }
  }

  const supportsSlash = (category: string) => SLASH_CATEGORIES.includes(category)

  const formatUsage = (usage: string, _name: string, category: string) => {
    if (supportsSlash(category)) return usage.startsWith("/") ? usage : `/${usage}`
    return usage.startsWith(DEFAULT_PREFIX) ? usage : `${DEFAULT_PREFIX}${usage}`
  }

  const totalFiltered = filteredCommands.length

  return (
    <div className="min-h-screen bg-black relative">
      {/* Fixed Video Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          style={{
            minWidth: "100%",
            minHeight: "100%",
            width: "auto",
            height: "auto",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <source src="/sky.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* ────── Header ────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-center mb-14"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-5 bg-gradient-to-r from-white via-[#a78bfa] to-white bg-clip-text text-transparent">
              Commands
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              Discover the full power of{" "}
              <span className="text-[#a78bfa] font-semibold">Demon Bot</span> with our comprehensive command library
            </p>

            {/* Command type pills */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 glass rounded-full text-sm font-medium text-blue-300 border border-blue-500/20">
                <FontAwesomeIcon icon={faSlash} className="w-3.5 h-3.5" />
                Slash Commands
              </span>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 glass rounded-full text-sm font-medium text-orange-300 border border-orange-500/20">
                <FontAwesomeIcon icon={faHashtag} className="w-3.5 h-3.5" />
                Prefix Commands
              </span>
            </div>
          </motion.div>

          {/* ────── Search & Filters ────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-12 space-y-6"
          >
            {/* Search bar */}
            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8b5cf6]/20 to-[#7c3aed]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative glass rounded-2xl p-1 border border-white/[0.06] hover:border-[#8b5cf6]/25 transition-colors duration-300">
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search commands, aliases, or descriptions…"
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

            {/* Category filters */}
            <div className="flex gap-2.5 flex-wrap justify-center">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${selectedCategory === null
                    ? "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-lg shadow-[#8b5cf6]/20"
                    : "glass border border-white/[0.06] text-gray-400 hover:text-white hover:border-[#8b5cf6]/25"
                  }`}
              >
                All ({commands.length})
              </motion.button>
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-6 py-2.5 text-sm font-semibold capitalize transition-all duration-300 ${selectedCategory === cat
                      ? "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-lg shadow-[#8b5cf6]/20"
                      : "glass border border-white/[0.06] text-gray-400 hover:text-white hover:border-[#8b5cf6]/25"
                    }`}
                >
                  {cat.replace(/_/g, " ")}
                </motion.button>
              ))}
            </div>

            {/* Results count */}
            {searchTerm && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-gray-500"
              >
                {totalFiltered} command{totalFiltered !== 1 ? "s" : ""} found
              </motion.p>
            )}
          </motion.div>

          {/* ────── Commands list ────── */}
          <div className="space-y-14">
            {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                className="space-y-5"
              >
                {/* Category header */}
                <div className="flex items-center flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8b5cf6]/15 to-[#7c3aed]/15 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={categoryIcons[category] || faBolt}
                        className="w-4 h-4 text-[#a78bfa]"
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-white capitalize">
                      {category.replace(/_/g, " ")}
                    </h2>
                    <span className="text-xs font-medium text-gray-500 bg-white/[0.04] px-2.5 py-1 rounded-full">
                      {categoryCommands.length}
                    </span>
                  </div>

                  <div className="flex gap-2 ml-auto">
                    {supportsSlash(category) && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                        <FontAwesomeIcon icon={faSlash} className="w-3 h-3" />
                        Slash
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
                      <FontAwesomeIcon icon={faHashtag} className="w-3 h-3" />
                      {supportsSlash(category) ? "Prefix" : "Prefix Only"}
                    </span>
                  </div>
                </div>

                {/* Commands grid */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {categoryCommands.map((command) => (
                    <motion.div
                      key={command.name}
                      variants={cardVariants}
                      layout
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                      <div className="relative glass rounded-xl border border-white/[0.06] hover:border-[#8b5cf6]/20 transition-all duration-300 overflow-hidden">
                        {/* Card header — clickable */}
                        <button
                          onClick={() => toggleCommandExpansion(command.name)}
                          className="w-full text-left p-5 hover:bg-white/[0.02] transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <FontAwesomeIcon icon={faBolt} className="w-3.5 h-3.5 text-[#8b5cf6]" />
                              <h3 className="text-[#a78bfa] font-mono text-lg font-semibold group-hover:text-white transition-colors">
                                {command.name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              {supportsSlash(command.category) && (
                                <FontAwesomeIcon icon={faSlash} className="w-3 h-3 text-blue-400/60" />
                              )}
                              <FontAwesomeIcon icon={faHashtag} className="w-3 h-3 text-gray-600" />
                              <FontAwesomeIcon
                                icon={expandedCommands.has(command.name) ? faChevronDown : faChevronRight}
                                className="w-3 h-3 text-gray-600 transition-transform"
                              />
                            </div>
                          </div>
                          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                            {command.description}
                          </p>
                        </button>

                        {/* Expanded details */}
                        <AnimatePresence>
                          {expandedCommands.has(command.name) && (
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
                                  <div className="bg-black/40 rounded-lg p-3 font-mono text-sm border border-white/[0.04]">
                                    <span className="text-[#a78bfa]">
                                      {formatUsage(command.usage, command.name, command.category)}
                                    </span>
                                  </div>
                                </div>

                                {/* Copy buttons */}
                                <div className="flex gap-2">
                                  {supportsSlash(command.category) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        copyCommand(command.name, true)
                                      }}
                                      className="flex-1 flex items-center justify-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-blue-500/20 text-blue-300 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all"
                                    >
                                      <FontAwesomeIcon
                                        icon={copiedCommand === `/${command.name}` ? faCheck : faSlash}
                                        className="w-3 h-3"
                                      />
                                      {copiedCommand === `/${command.name}` ? "Copied!" : "Copy Slash"}
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      copyCommand(command.name, false)
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-white/[0.06] text-gray-400 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all"
                                  >
                                    <FontAwesomeIcon
                                      icon={copiedCommand === `${DEFAULT_PREFIX}${command.name}` ? faCheck : faCopy}
                                      className="w-3 h-3"
                                    />
                                    {copiedCommand === `${DEFAULT_PREFIX}${command.name}` ? "Copied!" : "Copy Prefix"}
                                  </button>
                                </div>

                                {/* Aliases */}
                                {command.aliases?.length > 0 && (
                                  <div>
                                    <span className="text-xs text-gray-500 font-medium">Aliases</span>
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                      {command.aliases.map((alias) => (
                                        <span
                                          key={alias}
                                          className="text-[11px] font-mono bg-white/[0.04] text-gray-400 px-2 py-0.5 rounded-md border border-white/[0.04]"
                                        >
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

                                {/* Permissions */}
                                {command.userPermissions?.length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 text-red-400/70" />
                                      <span className="text-xs text-gray-500 font-medium">Required Permissions</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {command.userPermissions.map((perm) => (
                                        <span
                                          key={perm}
                                          className="text-[11px] bg-red-500/10 text-red-300 border border-red-500/15 px-2 py-0.5 rounded-md"
                                        >
                                          {perm.replace(/_/g, " ")}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Footer tags */}
                                <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                                  {command.guildOnly && (
                                    <span className="text-[11px] font-medium text-purple-300 bg-purple-500/10 border border-purple-500/15 px-2 py-0.5 rounded-md">
                                      <FontAwesomeIcon icon={faServer} className="w-2.5 h-2.5 mr-1" />
                                      Server Only
                                    </span>
                                  )}
                                  <span className="text-[11px] text-gray-600 capitalize">{command.category}</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Empty state */}
          {Object.keys(groupedCommands).length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                <FontAwesomeIcon icon={faTerminal} className="w-9 h-9 text-gray-700" />
              </div>
              <p className="text-gray-400 text-lg mb-2">No commands found</p>
              <p className="text-gray-600 text-sm">Try adjusting your search terms or category filter.</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll-to-top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
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