"use client"

import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faMagnifyingGlass,
  faCopy,
  faCheck,
  faHashtag,
  faSlash,
  faChevronDown,
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
  faTicket,
  faLightbulb,
  faRobot,
  faXmark,
} from "@fortawesome/free-solid-svg-icons"
import type { CommandOption, CommandsCatalog, SlimCommand } from "@/lib/commands-types"

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
  ticket: faTicket,
}

const tierStyles: Record<string, string> = {
  mod: "text-amber-300/90 bg-amber-500/10 border-amber-500/20",
  manager: "text-orange-300/90 bg-orange-500/10 border-orange-500/20",
  admin: "text-red-300/90 bg-red-500/10 border-red-500/20",
}

function formatOptionMeta(opt: CommandOption): string {
  const bits = [opt.type, opt.required ? "required" : "optional"]
  if (opt.maxLength != null) bits.push(`max ${opt.maxLength}`)
  return bits.join(" · ")
}

const OptionList = memo(function OptionList({ options }: { options: CommandOption[] }) {
  return (
    <ul className="space-y-1.5">
      {options.map(opt => (
        <li key={opt.name} className="rounded-lg bg-black/35 px-3 py-2 border border-white/[0.04]">
          <div className="flex flex-wrap items-baseline gap-2">
            <code className="text-xs text-sky-400 font-mono">{opt.name}</code>
            <span className="text-[10px] text-zinc-600">{formatOptionMeta(opt)}</span>
          </div>
          {opt.description ? (
            <p className="mt-1 text-xs text-zinc-500 leading-relaxed">{opt.description}</p>
          ) : null}
          {opt.choices && opt.choices.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {opt.choices.map(c => (
                <span
                  key={c.value}
                  className="rounded border border-white/[0.05] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
                >
                  {c.name}
                </span>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
})

interface CommandCardProps {
  command: SlimCommand
  expanded: boolean
  onToggle: (name: string) => void
  copied: string | null
  onCopy: (text: string) => void
}

const CommandCard = memo(function CommandCard({
  command,
  expanded,
  onToggle,
  copied,
  onCopy,
}: CommandCardProps) {
  const supportsSlash = command.type === "slash+prefix" || command.type === "slash-only"
  const slashCopy = `/${command.name}`
  const prefixCopy = `${DEFAULT_PREFIX}${command.name}`
  const panelId = `cmd-panel-${command.name}`
  const buttonId = `cmd-btn-${command.name}`

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onToggle(command.name)
    }
  }

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-zinc-950/80 transition-[border-color,background-color,box-shadow] duration-200 ${
        expanded
          ? "border-[#8b5cf6]/35 shadow-[0_0_0_1px_rgba(139,92,246,0.12)]"
          : "border-white/[0.06] hover:border-white/[0.12] hover:bg-zinc-900/80"
      }`}
    >
      <button
        id={buttonId}
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => onToggle(command.name)}
        onKeyDown={onKeyDown}
        className="flex w-full flex-1 flex-col gap-3 p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8b5cf6]/50 sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#8b5cf6]/10 text-[#a78bfa]">
              <FontAwesomeIcon icon={faBolt} className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-mono text-[15px] font-semibold text-[#c4b5fd] transition-colors group-hover:text-white">
                {command.name}
              </h3>
              <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-zinc-500">
                {command.description}
              </p>
            </div>
          </div>
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`mt-1 h-3 w-3 shrink-0 text-zinc-600 transition-transform duration-200 ${
              expanded ? "rotate-180 text-[#a78bfa]" : ""
            }`}
            aria-hidden
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {command.type === "slash+prefix" && (
            <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-300">
              Slash + Prefix
            </span>
          )}
          {command.type === "slash-only" && (
            <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-300">
              Slash Only
            </span>
          )}
          {command.type === "prefix-only" && (
            <span className="rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-300">
              Prefix Only
            </span>
          )}
          {command.hasSubcommands && (
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
              {command.subcommands.length} sub
            </span>
          )}
          {command.slashOptions.length > 0 && (
            <span className="rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300">
              {command.slashOptions.length} opts
            </span>
          )}
          {command.requiredTier && (
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize ${
                tierStyles[command.requiredTier] ?? "border-white/10 bg-white/5 text-zinc-300"
              }`}
            >
              {command.requiredTier}
            </span>
          )}
        </div>
      </button>

      {/* CSS grid expand — no layout thrash, only this card updates */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-4 border-t border-white/[0.05] px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                <FontAwesomeIcon icon={faTerminal} className="h-2.5 w-2.5" />
                Usage
              </p>
              <pre className="overflow-x-auto rounded-lg border border-white/[0.04] bg-black/50 px-3 py-2.5 font-mono text-xs text-[#c4b5fd]">
                {command.usage}
              </pre>
            </div>

            {command.usageHelp?.examples && command.usageHelp.examples.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                  <FontAwesomeIcon icon={faLightbulb} className="h-2.5 w-2.5" />
                  Examples
                </p>
                <ul className="space-y-1">
                  {command.usageHelp.examples.map(ex => (
                    <li
                      key={ex}
                      className="rounded-lg border border-white/[0.04] bg-black/35 px-3 py-2 font-mono text-xs text-zinc-400"
                    >
                      {DEFAULT_PREFIX}{ex}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {command.slashOptions.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                  <FontAwesomeIcon icon={faSlash} className="h-2.5 w-2.5" />
                  Slash options
                </p>
                <OptionList options={command.slashOptions} />
              </div>
            )}

            {command.hasSubcommands && command.subcommands.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                  <FontAwesomeIcon icon={faCodeBranch} className="h-2.5 w-2.5" />
                  Subcommands
                </p>
                <ul className="space-y-2">
                  {command.subcommands.map(sub => (
                    <li key={sub.name} className="rounded-lg border border-white/[0.04] bg-black/35 p-2.5">
                      <div className="flex flex-wrap items-start gap-2">
                        <code className="font-mono text-xs text-emerald-400">{sub.name}</code>
                        <span className="text-xs leading-relaxed text-zinc-500">{sub.description}</span>
                      </div>
                      {sub.options && sub.options.length > 0 && (
                        <div className="mt-2 border-l border-white/[0.06] pl-2">
                          <OptionList options={sub.options} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              {supportsSlash && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    onCopy(slashCopy)
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-xs font-medium text-blue-300 transition-colors hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                >
                  <FontAwesomeIcon icon={copied === slashCopy ? faCheck : faSlash} className="h-3 w-3" />
                  {copied === slashCopy ? "Copied" : "Copy slash"}
                </button>
              )}
              {command.type !== "slash-only" && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    onCopy(prefixCopy)
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                >
                  <FontAwesomeIcon icon={copied === prefixCopy ? faCheck : faCopy} className="h-3 w-3" />
                  {copied === prefixCopy ? "Copied" : "Copy prefix"}
                </button>
              )}
            </div>

            {command.aliases.length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Aliases</p>
                <div className="flex flex-wrap gap-1.5">
                  {command.aliases.map(alias => (
                    <span
                      key={alias}
                      className="rounded-md border border-white/[0.04] bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-zinc-400"
                    >
                      {alias}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.04] pt-3 text-[11px]">
              {command.cooldown > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md border border-orange-500/15 bg-orange-500/10 px-2 py-0.5 text-orange-300">
                  <FontAwesomeIcon icon={faClock} className="h-2.5 w-2.5" />
                  {command.cooldown}s
                </span>
              )}
              {command.guildOnly && (
                <span className="inline-flex items-center gap-1 rounded-md border border-purple-500/15 bg-purple-500/10 px-2 py-0.5 text-purple-300">
                  <FontAwesomeIcon icon={faServer} className="h-2.5 w-2.5" />
                  Server only
                </span>
              )}
              {command.userPermissions.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md border border-red-500/15 bg-red-500/10 px-2 py-0.5 text-red-300">
                  <FontAwesomeIcon icon={faShieldHalved} className="h-2.5 w-2.5" />
                  {command.userPermissions[0].replace(/_/g, " ")}
                  {command.userPermissions.length > 1 ? ` +${command.userPermissions.length - 1}` : ""}
                </span>
              )}
              {command.botPermissions.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md border border-violet-500/15 bg-violet-500/10 px-2 py-0.5 text-violet-300">
                  <FontAwesomeIcon icon={faRobot} className="h-2.5 w-2.5" />
                  Bot perms
                </span>
              )}
              <span className="ml-auto capitalize text-zinc-600">{command.category}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
})

export function CommandsExplorer({ catalog }: { catalog: CommandsCatalog }) {
  const { commands, categories, summary } = catalog
  const [searchTerm, setSearchTerm] = useState("")
  const deferredSearch = useDeferredValue(searchTerm)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setShowScrollTop(window.scrollY > 480)
        ticking = false
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current)
  }, [])

  const categoriesMap = useMemo(() => {
    const map: Record<string, SlimCommand[]> = {}
    for (const cmd of commands) {
      if (!map[cmd.category]) map[cmd.category] = []
      map[cmd.category].push(cmd)
    }
    return map
  }, [commands])

  const filteredByCategory = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()
    const result: Record<string, SlimCommand[]> = {}
    for (const cat of categories) {
      if (selectedCategory && cat !== selectedCategory) continue
      const cmds = (categoriesMap[cat] ?? []).filter(cmd => {
        if (!q) return true
        return (
          cmd.name.toLowerCase().includes(q) ||
          cmd.description.toLowerCase().includes(q) ||
          cmd.aliases.some(a => a.toLowerCase().includes(q)) ||
          cmd.subcommands.some(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)) ||
          cmd.slashOptions.some(o => o.name.toLowerCase().includes(q) || o.description.toLowerCase().includes(q))
        )
      })
      if (cmds.length) result[cat] = cmds
    }
    return result
  }, [categories, categoriesMap, deferredSearch, selectedCategory])

  const totalFiltered = useMemo(
    () => Object.values(filteredByCategory).reduce((a, b) => a + b.length, 0),
    [filteredByCategory],
  )

  const toggle = useCallback((name: string) => {
    setExpanded(prev => (prev === name ? null : name))
  }, [])

  const copyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(text)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(null), 1600)
    } catch { /* ignore */ }
  }, [])

  return (
    <div className="relative min-h-screen bg-black">
      {/* Lightweight atmospheric bg — no video decode */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(88,101,242,0.08),transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="relative z-10 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-12 text-center">
            <h1 className="mb-4 bg-gradient-to-r from-white via-[#c4b5fd] to-white bg-clip-text text-4xl font-bold text-transparent sm:text-5xl md:text-6xl">
              Commands
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
              Browse the full{" "}
              <span className="font-semibold text-[#a78bfa]">Demon Bot</span>{" "}
              command library — search by name, alias, or option.
            </p>

            <div className="mb-6 flex flex-wrap items-center justify-center gap-5 sm:gap-8">
              {[
                { value: summary.totalCommands, label: "Total", color: "text-white" },
                { value: summary.slashAndPrefix, label: "Slash + Prefix", color: "text-blue-400" },
                { value: summary.prefixOnly, label: "Prefix Only", color: "text-orange-400" },
                { value: summary.withSubcommands, label: "With Subs", color: "text-emerald-400" },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-5 sm:gap-8">
                  {i > 0 && <div className="hidden h-8 w-px bg-white/10 sm:block" />}
                  <div className="flex flex-col items-center">
                    <span className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</span>
                    <span className="text-xs text-zinc-500">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </header>

          <div className="mb-10 space-y-5">
            <div className="relative mx-auto max-w-2xl">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
              />
              <input
                ref={searchRef}
                type="search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search commands, aliases, options…"
                aria-label="Search commands"
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-zinc-950/90 pl-11 pr-24 text-sm text-white placeholder:text-zinc-500 outline-none transition-[border-color,box-shadow] focus:border-[#8b5cf6]/40 focus:ring-2 focus:ring-[#8b5cf6]/15 sm:h-14 sm:text-base"
              />
              {searchTerm ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-14 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-500 hover:text-white"
                >
                  <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
                </button>
              ) : null}
              <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-zinc-500 sm:inline-flex">
                Ctrl K
              </kbd>
            </div>

            <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Command categories">
              <button
                type="button"
                role="tab"
                aria-selected={selectedCategory === null}
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedCategory === null
                    ? "bg-[#8b5cf6] text-white"
                    : "border border-white/[0.06] bg-zinc-950/60 text-zinc-400 hover:border-white/15 hover:text-white"
                }`}
              >
                All ({commands.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                    selectedCategory === cat
                      ? "bg-[#8b5cf6] text-white"
                      : "border border-white/[0.06] bg-zinc-950/60 text-zinc-400 hover:border-white/15 hover:text-white"
                  }`}
                >
                  {cat.replace(/_/g, " ")}
                  <span className="ml-1.5 text-xs opacity-60">({categoriesMap[cat]?.length ?? 0})</span>
                </button>
              ))}
            </div>

            {deferredSearch && (
              <p className="text-center text-sm text-zinc-500" aria-live="polite">
                {totalFiltered} command{totalFiltered !== 1 ? "s" : ""} found
              </p>
            )}
          </div>

          <div className="space-y-12">
            {Object.entries(filteredByCategory).map(([category, cmds]) => (
              <section key={category} aria-labelledby={`cat-${category}`}>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8b5cf6]/10 text-[#a78bfa]">
                    <FontAwesomeIcon icon={categoryIcons[category] ?? faBolt} className="h-4 w-4" />
                  </div>
                  <h2 id={`cat-${category}`} className="text-xl font-bold capitalize text-white sm:text-2xl">
                    {category.replace(/_/g, " ")}
                  </h2>
                  <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-500">
                    {cmds.length}
                  </span>
                  <div className="ml-auto flex gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[11px] font-medium text-orange-300">
                      <FontAwesomeIcon icon={faHashtag} className="h-2.5 w-2.5" />
                      Prefix
                    </span>
                    {cmds.some(c => c.type !== "prefix-only") && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-300">
                        <FontAwesomeIcon icon={faSlash} className="h-2.5 w-2.5" />
                        Slash
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {cmds.map(command => (
                    <CommandCard
                      key={command.name}
                      command={command}
                      expanded={expanded === command.name}
                      onToggle={toggle}
                      copied={copied}
                      onCopy={copyText}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {Object.keys(filteredByCategory).length === 0 && (
            <div className="py-24 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03]">
                <FontAwesomeIcon icon={faTerminal} className="h-7 w-7 text-zinc-700" />
              </div>
              <p className="mb-1 text-lg text-zinc-400">No commands found</p>
              <p className="text-sm text-zinc-600">Try a different search or category.</p>
            </div>
          )}
        </div>
      </div>

      {showScrollTop && (
        <button
          type="button"
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/25 transition-transform hover:scale-105 active:scale-95"
        >
          <FontAwesomeIcon icon={faArrowUp} className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
