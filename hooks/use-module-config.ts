"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import isEqual from "lodash/isEqual"
import cloneDeep from "lodash/cloneDeep"
import { toast } from "sonner"

/**
 * Load-edit-save state for a dashboard module page.
 *
 * - One GET per module per 5 minutes (shared React Query cache; no polling, no refetch on focus).
 * - Edits stay in a local draft; nothing is sent until Save.
 * - Save is one POST. The server's answer is written straight into the cache, so there is no follow-up GET.
 */
export function useModuleConfig<T extends object, R = T>({
    guildId,
    key,
    url,
    fromSaveResponse,
    successMessage = "Settings saved",
}: {
    guildId: string
    key: string
    url: string
    /** When the POST returns a wrapper (e.g. { config, native }), pull the config out of it. */
    fromSaveResponse?: (res: R) => T
    successMessage?: string | ((res: R) => string | null)
}) {
    const queryClient = useQueryClient()
    const queryKey = [key, guildId]

    const query = useQuery<T>({
        queryKey,
        queryFn: async () => {
            const res = await fetch(url)
            if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || "Failed to load settings")
            return res.json()
        },
        enabled: Boolean(guildId),
        staleTime: 5 * 60 * 1000,
    })

    const [draft, setDraft] = useState<T | null>(null)
    useEffect(() => {
        if (query.data && draft === null) setDraft(cloneDeep(query.data))
    }, [query.data, draft])

    const mutation = useMutation({
        mutationFn: async (body: T) => {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })
            const json = await res.json().catch(() => null)
            if (!res.ok) throw new Error(json?.error || "Failed to save settings")
            return json as R
        },
        onSuccess: (res) => {
            const saved = fromSaveResponse ? fromSaveResponse(res) : (res as unknown as T)
            queryClient.setQueryData(queryKey, saved)
            setDraft(cloneDeep(saved))
            const msg = typeof successMessage === "function" ? successMessage(res) : successMessage
            if (msg) toast.success(msg)
        },
        onError: (error: Error) => toast.error(error.message),
    })

    const dirty = Boolean(draft && query.data && !isEqual(draft, query.data))
    const patch = (changes: Partial<T>) => setDraft((d) => (d ? { ...d, ...changes } : d))

    return {
        draft,
        patch,
        dirty,
        isLoading: query.isLoading || (query.isSuccess && draft === null),
        error: query.error as Error | null,
        save: () => draft && mutation.mutate(draft),
        saving: mutation.isPending,
        discard: () => query.data && setDraft(cloneDeep(query.data)),
        lastSaveResponse: mutation.data,
    }
}
