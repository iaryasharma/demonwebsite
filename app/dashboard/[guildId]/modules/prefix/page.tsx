"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faTerminal,
    faSave,
    faSpinner,
    faArrowLeft,
    faRotateLeft,
    faCheckCircle,
} from "@fortawesome/free-solid-svg-icons"
import { SaveBar } from "@/components/dashboard/save-bar"
import Link from "next/link"

import { toast } from "sonner"
import { cloneDeep, isEqual } from "lodash"

interface PrefixConfig {
    prefix: string;
}

export default function PrefixModulePage({
    params
}: {
    params: Promise<{ guildId: string }>
}) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { guildId } = React.use(params)
    const queryClient = useQueryClient()

    const [config, setConfig] = useState<PrefixConfig | null>(null)
    const [originalConfig, setOriginalConfig] = useState<PrefixConfig | null>(null)
    const [saving, setSaving] = useState(false)

    const hasUnsavedChanges = config && originalConfig && !isEqual(config, originalConfig)

    const { data: serverConfig, isLoading: configLoading } = useQuery<PrefixConfig>({
        queryKey: ["prefix", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/prefix`)
            if (!res.ok) throw new Error("Failed to fetch prefix config")
            return res.json()
        },
        enabled: !!guildId && status === "authenticated"
    })

    useEffect(() => {
        if (serverConfig && !originalConfig) {
            setConfig(cloneDeep(serverConfig))
            setOriginalConfig(cloneDeep(serverConfig))
        }
    }, [serverConfig, originalConfig])

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/dashboard")
        }
    }, [status, router])

    const handleSave = async () => {
        if (!config) return
        setSaving(true)
        try {
            const res = await fetch(`/api/guilds/${guildId}/prefix`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            })
            if (res.ok) {
                const updatedConfig = await res.json();
                setOriginalConfig(cloneDeep(updatedConfig));
                setConfig(cloneDeep(updatedConfig)); // Update config to reflect any server-side changes
                queryClient.invalidateQueries({ queryKey: ["prefix", guildId] });
                queryClient.invalidateQueries({ queryKey: ["guild-settings", guildId] });
                toast.success("Prefix updated successfully!");
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || "Failed to update prefix");
            }
        } catch (error) {
            console.error("Failed to save prefix config:", error)
            toast.error("An error occurred while saving");
        } finally {
            setSaving(false)
        }
    }

    const handleReset = () => {
        if (config) {
            setConfig({ ...config, prefix: "!!" });
        } else {
            setConfig({ prefix: "!!" });
        }
    }

    const handleDiscard = () => {
        if (originalConfig) {
            setConfig(cloneDeep(originalConfig))
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.substring(0, 5)
        setConfig(prev => prev ? { ...prev, prefix: val } : { prefix: val })
    }

    if (status === "loading" || configLoading || !config) {
        return (
            <div className="min-h-[500px] flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#8b5cf6] animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href={`/dashboard/${guildId}/modules`}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FontAwesomeIcon icon={faTerminal} className="w-8 h-8 text-[#8b5cf6]" />
                        Custom Prefix
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Change the prefix used to trigger commands in this server.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="glass rounded-2xl border border-white/10 overflow-hidden relative">
                <div className="p-8">
                    <div className="max-w-md">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Bot Prefix (Max 5 chars)
                        </label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={config.prefix}
                                onChange={handleInputChange}
                                maxLength={5}
                                placeholder="!!"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                            />
                            <button
                                onClick={handleReset}
                                className="px-4 py-3 bg-gray-600/20 hover:bg-gray-600/40 text-gray-300 rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2"
                                title="Reset to Default"
                            >
                                <FontAwesomeIcon icon={faRotateLeft} className="text-white w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <SaveBar
                isVisible={!!hasUnsavedChanges || saving}
                isSaving={saving}
                onSave={handleSave}
                onDiscard={handleDiscard}
                message="You have unsaved changes in Prefix"
            />
        </div>
    )
}
