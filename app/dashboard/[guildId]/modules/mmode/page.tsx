"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faWrench,
    faLock,
    faUnlock,
    faSpinner,
    faArrowLeft,
    faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"

export default function MModeModulePage({
    params
}: {
    params: Promise<{ guildId: string }>
}) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { guildId } = React.use(params)
    const queryClient = useQueryClient()

    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)

    const { data, isLoading } = useQuery<{ enabled: boolean }>({
        queryKey: ["mmode", guildId],
        queryFn: async () => {
            const res = await fetch(`/api/guilds/${guildId}/modules/mmode`)
            if (!res.ok) throw new Error("Failed to fetch mmode state")
            return res.json()
        },
        enabled: status === "authenticated" && !!guildId,
        refetchInterval: 30000 // Refetch every 30s as Discord states might change
    })

    useEffect(() => {
        if (data) {
            setIsMaintenanceMode(data.enabled)
        }
    }, [data])

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/dashboard")
        }
    }, [status, router])

    const toggleMutation = useMutation({
        mutationFn: async (enable: boolean) => {
            const res = await fetch(`/api/guilds/${guildId}/modules/mmode`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: enable })
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to toggle maintenance mode")
            }
            return res.json()
        },
        onSuccess: (newData) => {
            queryClient.setQueryData(["mmode", guildId], newData)
            setIsMaintenanceMode(newData.enabled)
        }
    })

    const handleToggle = () => {
        toggleMutation.mutate(!isMaintenanceMode)
    }

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-[500px] flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#8b5cf6] animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto pb-24">
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
                        <FontAwesomeIcon icon={faWrench} className="w-8 h-8 text-yellow-500" />
                        Maintenance Mode
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Lock down the server to perform essential updates or configuration.
                    </p>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="mb-8 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-4">
                <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                    <h3 className="text-yellow-500 font-semibold mb-1">What happens when enabled?</h3>
                    <ul className="text-yellow-500/80 text-sm list-disc list-inside space-y-1">
                        <li>All public text and voice channels are temporarily locked.</li>
                        <li>A designated read-only <code className="text-yellow-400 bg-yellow-500/10 px-1 rounded">maintenance-mode-chat</code> channel is created.</li>
                        <li>A <code className="text-yellow-400 bg-yellow-500/10 px-1 rounded">Maintenance mode VC</code> is spawned for members to connect to.</li>
                        <li>This action utilizes Discord&apos;s REST APIs, which might take a few seconds to execute fully.</li>
                        <li className="font-semibold text-yellow-400">
                            All slash and prefix commands will receive <span className="underline">no response</span> — Discord will show &quot;Interaction Failed&quot; to users. This is expected but may appear as if the bot is broken.
                        </li>
                    </ul>
                </div>
            </div>

            {/* Big Toggle UI */}
            <div className="glass rounded-2xl border border-white/10 overflow-hidden relative p-12 text-center">
                <div className={`absolute top-0 left-0 w-full h-1`} />

                <motion.div
                    animate={{ scale: toggleMutation.isPending ? 0.95 : 1 }}
                    className="inline-block relative"
                >
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 mx-auto transition-all shadow-2xl relative
                        ${isMaintenanceMode ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20' : 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/20'}`}
                    >
                        <FontAwesomeIcon
                            icon={toggleMutation.isPending ? faSpinner : (isMaintenanceMode ? faLock : faUnlock)}
                            className={`w-12 h-12 text-white ${toggleMutation.isPending ? 'animate-spin' : ''}`}
                        />
                    </div>
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">
                    {isMaintenanceMode ? 'Maintenance Mode is Active' : 'Server is Operating Normally'}
                </h2>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                    {isMaintenanceMode
                        ? 'Channels are locked and members are viewing the maintenance splash screens.'
                        : 'All server channels and configurations are unlocked.'}
                </p>

                <button
                    onClick={handleToggle}
                    disabled={toggleMutation.isPending}
                    className={`px-8 py-4 rounded-xl font-bold text-lg transition-all border shadow-xl flex items-center justify-center gap-3 mx-auto
                        ${isMaintenanceMode
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/30'
                            : 'bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30 hover:border-[#8b5cf6]/50'}
                        disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {toggleMutation.isPending && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                    {isMaintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                </button>
            </div>
        </div>
    )
}
