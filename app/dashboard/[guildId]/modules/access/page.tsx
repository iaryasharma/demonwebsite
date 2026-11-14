"use client"

import React, { useMemo, useState } from "react"
import { faSliders } from "@fortawesome/free-solid-svg-icons"
import { SaveBar } from "@/components/dashboard/save-bar"
import { ErrorState, LoadingState, ModuleHeader, Section, Toggle } from "@/components/dashboard/form-controls"
import { useModuleConfig } from "@/hooks/use-module-config"
import catalogData from "@/json/commands_list.json"

interface AccessConfig {
    disabledCommands: string[]
    disabledCategories: string[]
}

type CatalogCommand = { name: string; description: string; category: string; type: string; developerOnly?: boolean }

// Must match demon-v5/utils/commandToggle.js
const PROTECTED_COMMANDS = new Set(["help"])
const PROTECTED_CATEGORIES = new Set(["developer"])

const CATEGORY_LABELS: Record<string, string> = {
    action: "Action", announcement: "Announcements", fun: "Fun", giveaway: "Giveaways", image: "Image",
    information: "Information", moderator: "Moderation", settings: "Settings", support: "Support",
    ticket: "Tickets", utility: "Utility", voicemod: "Voice moderation", welcome: "Welcome & leave",
}

export default function CommandAccessPage({ params }: { params: Promise<{ guildId: string }> }) {
    const { guildId } = React.use(params)
    const [search, setSearch] = useState("")
    const m = useModuleConfig<AccessConfig>({
        guildId,
        key: "command-toggle",
        url: `/api/guilds/${guildId}/modules/command-toggle`,
        successMessage: "Command access saved. The bot picks it up within 30 seconds.",
    })

    // Group the static catalogue once; it ships with the site, so it costs no request
    const groups = useMemo(() => {
        const byCategory = new Map<string, CatalogCommand[]>()
        for (const cmd of (catalogData as { commands: CatalogCommand[] }).commands) {
            const cat = cmd.category.toLowerCase()
            if (cmd.developerOnly || PROTECTED_CATEGORIES.has(cat) || PROTECTED_COMMANDS.has(cmd.name)) continue
            byCategory.set(cat, [...(byCategory.get(cat) ?? []), cmd])
        }
        return [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b))
    }, [])

    if (m.error) return <ErrorState message={m.error.message} />
    if (m.isLoading || !m.draft) return <LoadingState />
    const c = m.draft
    const q = search.trim().toLowerCase()

    const setCategory = (cat: string, on: boolean) =>
        m.patch({ disabledCategories: on ? c.disabledCategories.filter((x) => x !== cat) : [...c.disabledCategories, cat] })
    const setCommand = (name: string, on: boolean) =>
        m.patch({ disabledCommands: on ? c.disabledCommands.filter((x) => x !== name) : [...c.disabledCommands, name] })

    return (
        <div className="max-w-4xl mx-auto pb-28 space-y-6">
            <ModuleHeader guildId={guildId} icon={faSliders} title="Command Access" description="Turn whole categories or single commands off in this server." />

            <div className="glass rounded-2xl border border-white/[0.06] p-4 text-sm text-gray-400 space-y-1">
                <p>Switched-off prefix commands get no reply at all. Switched-off slash commands answer privately that they are off.</p>
                <p>
                    Discord only lets server admins hide slash commands from the list themselves: Server Settings → Integrations → Demon.
                    /help and developer commands cannot be switched off.
                </p>
            </div>

            <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search commands"
                aria-label="Search commands"
                className="w-full bg-black/40 border border-white/[0.06] text-white text-sm rounded-xl focus:ring-[#8b5cf6] focus:border-[#8b5cf6] p-3"
            />

            {groups.map(([cat, cmds]) => {
                const visible = q ? cmds.filter((cmd) => cmd.name.toLowerCase().includes(q) || cmd.description.toLowerCase().includes(q)) : cmds
                if (!visible.length) return null
                const categoryOn = !c.disabledCategories.includes(cat)
                return (
                    <Section key={cat} title={CATEGORY_LABELS[cat] ?? cat}>
                        <Toggle label="Whole category" description={`${cmds.length} command${cmds.length === 1 ? "" : "s"}`} checked={categoryOn} onChange={(on) => setCategory(cat, on)} />
                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 pt-2 border-t border-white/[0.06]">
                            {visible.map((cmd) => (
                                <Toggle
                                    key={cmd.name}
                                    label={cmd.type === "prefix-only" ? cmd.name : cmd.name === "Report message" ? cmd.name : `/${cmd.name}`}
                                    description={cmd.description}
                                    checked={categoryOn && !c.disabledCommands.includes(cmd.name)}
                                    disabled={!categoryOn}
                                    onChange={(on) => setCommand(cmd.name, on)}
                                />
                            ))}
                        </div>
                    </Section>
                )
            })}

            <SaveBar isVisible={m.dirty} isSaving={m.saving} onSave={m.save} onDiscard={m.discard} />
        </div>
    )
}
