"use client"

import React from "react"
import { faRobot } from "@fortawesome/free-solid-svg-icons"
import { SaveBar } from "@/components/dashboard/save-bar"
import { MultiRolePicker } from "@/components/dashboard/settings/multi-role-picker"
import { ChannelListPicker } from "@/components/dashboard/settings/channel-list-picker"
import { ErrorState, ListEditor, LoadingState, ModuleHeader, NumberField, Section, Toggle } from "@/components/dashboard/form-controls"
import { useModuleConfig } from "@/hooks/use-module-config"

interface AutoModConfig {
    enabled: boolean
    blockedWords: string[]
    smartWords: string[]
    blockInvites: boolean
    blockLinks: boolean
    regexPatterns: string[]
    presets: number[]
    maxMentions: number
    raidProtection: boolean
    antiSpam: boolean
    ignoredChannels: string[]
    ignoredRoles: string[]
    nativeSynced: boolean
    allowedDomains: string[]
    scamProtection: boolean
    blockDuplicates: boolean
    maxCapsPercent: number
    maxEmojis: number
    maxLines: number
    blockZalgo: boolean
    strikeLimit: number
    strikeTimeoutMin: number
}

interface SaveResponse {
    config: AutoModConfig
    native: { ok: true } | { ok: false; reason: "missing_permission" | "sync_failed" }
}

const PRESETS = [
    { id: 1, label: "Profanity" },
    { id: 2, label: "Sexual content" },
    { id: 3, label: "Slurs" },
]

export default function AutoModPage({ params }: { params: Promise<{ guildId: string }> }) {
    const { guildId } = React.use(params)
    const m = useModuleConfig<AutoModConfig, SaveResponse>({
        guildId,
        key: "automod",
        url: `/api/guilds/${guildId}/modules/automod`,
        fromSaveResponse: (r) => r.config,
        successMessage: (r) =>
            r.native.ok
                ? "AutoMod saved and synced to Discord"
                : r.native.reason === "missing_permission"
                    ? "Saved. Discord AutoMod could not be updated: give the bot Manage Server. Demon enforces the rules itself for now."
                    : "Saved. Discord AutoMod could not be updated right now, so Demon enforces the rules itself.",
    })

    if (m.error) return <ErrorState message={m.error.message} />
    if (m.isLoading || !m.draft) return <LoadingState />
    const c = m.draft

    return (
        <div className="max-w-4xl mx-auto pb-28 space-y-6">
            <ModuleHeader
                guildId={guildId}
                icon={faRobot}
                title="AutoMod"
                description="Discord's built-in AutoMod enforces most rules; Demon adds smart words, scam links and more."
            />

            <Section title="Status">
                <Toggle label="Enable AutoMod" checked={c.enabled} onChange={(v) => m.patch({ enabled: v })} />
                <p className="text-sm text-gray-400">
                    Enforced by:{" "}
                    <span className="text-white">
                        {!c.enabled ? "Off" : c.nativeSynced ? "Discord's built-in AutoMod + Demon" : "Demon (Discord sync not active)"}
                    </span>
                    . Members with Manage Messages are never affected.
                </p>
            </Section>

            <Section title="Words" description="Discord's filter checks exact words and * wildcards. Smart words are Demon's own: they also catch f.u.c.k, fuuuck and b@d w0rd, and match whole words only.">
                <ListEditor label="Blocked words (Discord)" value={c.blockedWords} max={4000} onChange={(v) => m.patch({ blockedWords: v })} placeholder="one word or phrase per line" />
                <ListEditor label="Smart words (Demon)" value={c.smartWords} max={1000} onChange={(v) => m.patch({ smartWords: v })} placeholder="one word or phrase per line" />
                <div className="space-y-2">
                    <span className="font-semibold text-white block">Discord word lists</span>
                    <div className="flex flex-wrap gap-4">
                        {PRESETS.map((p) => (
                            <Toggle
                                key={p.id}
                                label={p.label}
                                checked={c.presets.includes(p.id)}
                                onChange={(on) => m.patch({ presets: on ? [...c.presets, p.id] : c.presets.filter((x) => x !== p.id) })}
                            />
                        ))}
                    </div>
                </div>
                <ListEditor label="Regex patterns (Rust syntax)" value={c.regexPatterns} max={8} rows={3} onChange={(v) => m.patch({ regexPatterns: v })} placeholder="(?i)free\s+nitro" />
            </Section>

            <Section title="Links and spam">
                <Toggle label="Scam and phishing protection" description="Lookalike Discord/Steam links and fake Nitro offers (Demon)." checked={c.scamProtection} onChange={(v) => m.patch({ scamProtection: v })} />
                <Toggle label="Block invite links" checked={c.blockInvites} onChange={(v) => m.patch({ blockInvites: v })} />
                <Toggle label="Block links" description="With allowed domains below, only links to those domains stay." checked={c.blockLinks} onChange={(v) => m.patch({ blockLinks: v })} />
                <ListEditor label="Allowed domains" value={c.allowedDomains} max={50} rows={3} onChange={(v) => m.patch({ allowedDomains: v })} placeholder="youtube.com" />
                <Toggle label="Anti-spam" checked={c.antiSpam} onChange={(v) => m.patch({ antiSpam: v })} />
                <NumberField label="Max mentions per message" description="0 = off" value={c.maxMentions} min={0} max={50} onChange={(v) => m.patch({ maxMentions: v })} />
                <Toggle label="Mention-raid protection" description="Discord's own detection of mention raids." checked={c.raidProtection} onChange={(v) => m.patch({ raidProtection: v })} disabled={c.maxMentions === 0} />
            </Section>

            <Section title="Demon extras" description="Checks Discord's AutoMod cannot do.">
                <Toggle label="Remove repeated messages" description="The same message 3 times in 30 seconds." checked={c.blockDuplicates} onChange={(v) => m.patch({ blockDuplicates: v })} />
                <Toggle label="Remove zalgo text" checked={c.blockZalgo} onChange={(v) => m.patch({ blockZalgo: v })} />
                <div className="grid sm:grid-cols-3 gap-4">
                    <NumberField label="Max capitals" suffix="%" description="0 = off" value={c.maxCapsPercent} min={0} max={100} onChange={(v) => m.patch({ maxCapsPercent: v })} />
                    <NumberField label="Max emojis" description="0 = off" value={c.maxEmojis} min={0} max={100} onChange={(v) => m.patch({ maxEmojis: v })} />
                    <NumberField label="Max lines" description="0 = off" value={c.maxLines} min={0} max={100} onChange={(v) => m.patch({ maxLines: v })} />
                </div>
            </Section>

            <Section title="Strikes" description="Time members out after repeated violations (Discord's blocks and Demon's count together).">
                <div className="grid sm:grid-cols-2 gap-4">
                    <NumberField label="Violations in 10 minutes" description="0 = off" value={c.strikeLimit} min={0} max={20} onChange={(v) => m.patch({ strikeLimit: v })} />
                    <NumberField label="Timeout length" suffix="minutes" value={c.strikeTimeoutMin} min={1} max={1440} onChange={(v) => m.patch({ strikeTimeoutMin: v })} />
                </div>
            </Section>

            <Section title="Ignored">
                <div className="space-y-2">
                    <span className="font-semibold text-white block">Channels (max 50)</span>
                    <ChannelListPicker guildId={guildId} value={c.ignoredChannels} max={50} onChange={(v) => m.patch({ ignoredChannels: v })} />
                </div>
                <div className="space-y-2">
                    <span className="font-semibold text-white block">Roles (max 20)</span>
                    <MultiRolePicker guildId={guildId} value={c.ignoredRoles} onChange={(v) => m.patch({ ignoredRoles: v.slice(0, 20) })} />
                </div>
            </Section>

            <SaveBar isVisible={m.dirty} isSaving={m.saving} onSave={m.save} onDiscard={m.discard} />
        </div>
    )
}
