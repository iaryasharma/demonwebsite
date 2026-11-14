"use client"

import React from "react"
import { faUserShield } from "@fortawesome/free-solid-svg-icons"
import { SaveBar } from "@/components/dashboard/save-bar"
import { ErrorState, LoadingState, ModuleHeader, NumberField, Section, Toggle } from "@/components/dashboard/form-controls"
import { useModuleConfig } from "@/hooks/use-module-config"

interface RaidConfig {
    enabled: boolean
    joinThreshold: number
    windowSeconds: number
    raidDurationMin: number
    minAccountAgeDays: number
    action: "alert" | "timeout" | "kick" | "ban"
}

const ACTIONS: { value: RaidConfig["action"]; label: string; hint: string }[] = [
    { value: "alert", label: "Alert only", hint: "Log the raid, do nothing to members." },
    { value: "timeout", label: "Timeout", hint: "Time out new accounts for the raid's length. Bot needs Timeout Members." },
    { value: "kick", label: "Kick", hint: "Kick new accounts. Bot needs Kick Members." },
    { value: "ban", label: "Ban", hint: "Ban new accounts. Bot needs Ban Members." },
]

export default function RaidPage({ params }: { params: Promise<{ guildId: string }> }) {
    const { guildId } = React.use(params)
    const m = useModuleConfig<RaidConfig>({
        guildId,
        key: "raid",
        url: `/api/guilds/${guildId}/modules/raid`,
        successMessage: "Anti-raid settings saved",
    })

    if (m.error) return <ErrorState message={m.error.message} />
    if (m.isLoading || !m.draft) return <LoadingState />
    const c = m.draft

    return (
        <div className="max-w-4xl mx-auto pb-28 space-y-6">
            <ModuleHeader guildId={guildId} icon={faUserShield} title="Raid Protection" description="React automatically when a burst of new members joins." />

            <Section title="Status">
                <Toggle label="Enable raid protection" checked={c.enabled} onChange={(v) => m.patch({ enabled: v })} />
            </Section>

            <Section title="When is it a raid?">
                <div className="grid sm:grid-cols-2 gap-4">
                    <NumberField label="Joins" value={c.joinThreshold} min={2} max={100} onChange={(v) => m.patch({ joinThreshold: v })} />
                    <NumberField label="Within" suffix="seconds" value={c.windowSeconds} min={5} max={300} onChange={(v) => m.patch({ windowSeconds: v })} />
                </div>
                <NumberField label="Raid mode lasts" suffix="minutes" value={c.raidDurationMin} min={1} max={120} onChange={(v) => m.patch({ raidDurationMin: v })} />
            </Section>

            <Section title="During a raid" description="The members who triggered it are handled too.">
                <fieldset className="space-y-2">
                    <legend className="font-semibold text-white mb-2">Action for new accounts</legend>
                    {ACTIONS.map((a) => (
                        <label key={a.value} className="flex items-start gap-3 cursor-pointer">
                            <input type="radio" name="raid-action" className="mt-1 accent-[#8b5cf6]" checked={c.action === a.value} onChange={() => m.patch({ action: a.value })} />
                            <span>
                                <span className="text-white block">{a.label}</span>
                                <span className="text-sm text-gray-400">{a.hint}</span>
                            </span>
                        </label>
                    ))}
                </fieldset>
                <NumberField
                    label="Let older accounts through"
                    description="Accounts at least this many days old are left alone. 0 = act on everyone who joins during a raid."
                    suffix="days"
                    value={c.minAccountAgeDays}
                    min={0}
                    max={365}
                    onChange={(v) => m.patch({ minAccountAgeDays: v })}
                />
            </Section>

            <SaveBar isVisible={m.dirty} isSaving={m.saving} onSave={m.save} onDiscard={m.discard} />
        </div>
    )
}
