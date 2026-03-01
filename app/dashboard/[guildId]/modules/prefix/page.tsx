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
import Link from "next/link"

export default function PrefixModulePage({
    params
}: {
    params: Promise<{ guildId: string }>
}) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { guildId } = React.use(params)
    const queryClient = useQueryClient()

    const [inputPrefix, setInputPrefix] = useState("")
    const [unsavedChanges, setUnsavedChanges] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")

    const { data: currentPrefix, isLoading } = useQuery<{ prefix: string }>({
        queryKey: ["prefix", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/prefix`)
            if (!res.ok) throw new Error("Failed to fetch prefix")
            return res.json()
        },
        enabled: status === "authenticated" && !!guildId
    })

    useEffect(() => {
        if (currentPrefix) {
            setInputPrefix(currentPrefix.prefix)
            setUnsavedChanges(false)
        }
    }, [currentPrefix])

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/dashboard")
        }
    }, [status, router])

    const saveMutation = useMutation({
        mutationFn: async (newPrefix: string) => {
            const res = await fetch(`/api/guilds/${guildId}/prefix`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prefix: newPrefix })
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to update prefix")
            }
            return res.json()
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["prefix", guildId] })
            queryClient.invalidateQueries({ queryKey: ["guild-settings", guildId] })
            setUnsavedChanges(false)
            setSuccessMessage("Prefix updated successfully!")
            setTimeout(() => setSuccessMessage(""), 3000)
        }
    })

    const handleSave = () => {
        if (!inputPrefix.trim()) return
        saveMutation.mutate(inputPrefix.trim().substring(0, 5))
    }

    const handleReset = () => {
        setInputPrefix("!!")
        setUnsavedChanges("!!" !== currentPrefix?.prefix)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.substring(0, 5)
        setInputPrefix(val)
        setUnsavedChanges(val !== currentPrefix?.prefix)
    }

    if (status === "loading" || isLoading) {
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
                                value={inputPrefix}
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

                {/* Save Bar */}
                <AnimatePresence>
                    {(unsavedChanges || successMessage || saveMutation.isPending) && (
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-r from-[#8b5cf6]/20 to-[#6d28d9]/20 backdrop-blur-md border-t border-[#8b5cf6]/30"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-white">
                                    {successMessage ? (
                                        <>
                                            <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-400" />
                                            <span>{successMessage}</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                                            <span>You have unsaved changes</span>
                                        </>
                                    )}
                                </div>
                                {!successMessage && (
                                    <button
                                        onClick={handleSave}
                                        disabled={saveMutation.isPending || !inputPrefix.trim()}
                                        className="px-6 py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {saveMutation.isPending ? (
                                            <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                                        )}
                                        Save Changes
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
