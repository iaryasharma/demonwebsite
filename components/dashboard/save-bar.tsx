"use client"

import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave, faSpinner, faTriangleExclamation, faRotateLeft } from "@fortawesome/free-solid-svg-icons"
import { useParams } from "next/navigation"

interface SaveBarProps {
    isVisible: boolean
    isSaving: boolean
    showSuccess?: boolean // Keep for backwards compat if needed, but we'll use toasts
    onSave: () => void
    onDiscard?: () => void
    message?: string
}

export function SaveBar({
    isVisible,
    isSaving,
    showSuccess,
    onSave,
    onDiscard,
    message = "You have unsaved changes",
}: SaveBarProps) {
    const params = useParams()
    const guildId = params?.guildId

    // Only show the bar if it's NOT in the success state (since toast will handle that)
    // and if it's visible.
    const shouldShow = isVisible && !showSuccess

    return (
        <AnimatePresence>
            {shouldShow && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={`fixed bottom-8 left-0 right-0 z-[100] px-4 pointer-events-none transition-all duration-300 ${guildId ? "lg:pl-64" : ""
                        }`}
                >
                    <div className="max-w-3xl mx-auto flex justify-center">
                        <div className="pointer-events-auto bg-[#0d0d14]/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-6 ring-1 ring-white/10 w-full group">
                            <div className="flex items-center gap-3 pl-2">
                                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                                    <FontAwesomeIcon icon={faTriangleExclamation} className="w-5 h-5 text-yellow-500 animate-pulse" />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-white font-bold text-sm leading-tight">Careful!</p>
                                    <p className="text-gray-400 text-[13px] leading-tight">{message}</p>
                                </div>
                                <div className="sm:hidden text-white font-medium text-sm">
                                    {message}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pr-1">
                                {onDiscard && (
                                    <button
                                        onClick={onDiscard}
                                        disabled={isSaving}
                                        className="h-11 px-5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-sm font-semibold transition-all border border-white/5 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faRotateLeft} className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Discard</span>
                                    </button>
                                )}
                                <button
                                    onClick={onSave}
                                    disabled={isSaving}
                                    className="h-11 px-8 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#8b5cf6]/25 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 group/btn"
                                >
                                    {isSaving ? (
                                        <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <FontAwesomeIcon icon={faSave} className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                    )}
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
