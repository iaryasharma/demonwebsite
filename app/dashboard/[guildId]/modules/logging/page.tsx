"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClipboardList, faArrowLeft, faSpinner } from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"
import isEqual from "lodash/isEqual"
import cloneDeep from "lodash/cloneDeep"
import { SaveBar } from "@/components/dashboard/save-bar"
import { toast } from "sonner"
import { CategoryNav } from "@/components/dashboard/logging/category-nav"
import { CategorySettingsPanel } from "@/components/dashboard/logging/category-settings-panel"
import { FallbackSection } from "@/components/dashboard/logging/fallback-section"
import { LoggingToggle } from "@/components/dashboard/logging/logging-toggle"
import {
    CATEGORY_META,
    EVENT_KEYS,
    normalizeLoggingConfig,
    type LoggingConfig,
} from "@/components/dashboard/logging/logging-types"
import type { RoutableCategory } from "@/lib/logging-constants"

export default function LoggingModulePage({
    params,
}: {
    params: Promise<{ guildId: string }>
}) {
    const { guildId } = React.use(params)
    const [config, setConfig] = useState<LoggingConfig | null>(null)
    const [originalConfig, setOriginalConfig] = useState<LoggingConfig | null>(null)
    const [saving, setSaving] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<RoutableCategory>("moderation")

    const hasUnsavedChanges = config && originalConfig && !isEqual(config, originalConfig)

    const { data: serverConfig, isLoading: configLoading } = useQuery({
        queryKey: ["logging", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/modules/logging`)
            if (!res.ok) throw new Error("Failed to fetch logging config")
            return res.json()
        },
        enabled: !!guildId,
    })

    useEffect(() => {
        if (serverConfig && !originalConfig) {
            const normalized = normalizeLoggingConfig(serverConfig)
            setConfig(cloneDeep(normalized))
            setOriginalConfig(cloneDeep(normalized))
        }
    }, [serverConfig, originalConfig])

    const enabledCount = useMemo(() => {
        if (!config) return 0
        return EVENT_KEYS.filter(k => config.events[k]).length
    }, [config])

    const selectedMeta = CATEGORY_META.find(c => c.key === selectedCategory)

    const handleSave = async () => {
        if (!config) return
        setSaving(true)
        try {
            const res = await fetch(`/api/guilds/${guildId}/modules/logging`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...config, categoryRoutingMigrated: true }),
            })
            if (res.ok) {
                setOriginalConfig(cloneDeep(config))
                toast.success("Logging configuration saved!")
            } else {
                toast.error("Failed to save logging configuration")
            }
        } catch (error) {
            console.error("Failed to save logging config:", error)
            toast.error("An error occurred while saving")
        } finally {
            setSaving(false)
        }
    }

    if (configLoading || !config) {
        return (
            <div className="flex items-center justify-center py-20">
                <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin text-[#8b5cf6]" />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6 pb-24">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <Link
                        href={`/dashboard/${guildId}/modules`}
                        className="mb-2 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5" />
                        Back to Modules
                    </Link>
                    <div className="mt-2 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                            <FontAwesomeIcon icon={faClipboardList} className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Logging</h1>
                            <p className="mt-1 text-sm text-zinc-400">
                                {EVENT_KEYS.length} events · {enabledCount} enabled
                                {selectedMeta ? ` · editing ${selectedMeta.label}` : ""}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-zinc-950/70 px-4 py-3">
                    <LoggingToggle
                        checked={config.enabled}
                        accent="green"
                        aria-label="Enable logging module"
                        onChange={enabled => setConfig({ ...config, enabled })}
                    />
                    <div>
                        <div className="text-sm font-semibold text-white">
                            {config.enabled ? "Enabled" : "Disabled"}
                        </div>
                        <div className="text-[11px] text-zinc-500">Master logging switch</div>
                    </div>
                </div>
            </div>

            <FallbackSection guildId={guildId} config={config} onChange={setConfig} />

            <section className="space-y-5 rounded-2xl border border-white/[0.06] bg-zinc-950/80 p-5 sm:p-6">
                <CategoryNav
                    config={config}
                    selected={selectedCategory}
                    onSelect={setSelectedCategory}
                    disabled={config.fallbackOnly}
                />

                {config.fallbackOnly ? (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-100/90">
                        Category settings are paused while <strong>Send everything to fallback</strong> is on.
                        Turn that off above to configure routing per category.
                    </div>
                ) : (
                    <CategorySettingsPanel
                        guildId={guildId}
                        categoryKey={selectedCategory}
                        config={config}
                        onChange={setConfig}
                    />
                )}
            </section>

            <SaveBar
                isVisible={!!hasUnsavedChanges || saving}
                isSaving={saving}
                onSave={handleSave}
                onDiscard={() => originalConfig && setConfig(cloneDeep(originalConfig))}
                message="You have unsaved changes in Logging"
            />
        </div>
    )
}
