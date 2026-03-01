"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Keep data fresh for 1 minute before refetching
                        staleTime: 60 * 1000,
                        // Prevent duplicate background fetching on window focus
                        refetchOnWindowFocus: false,
                        // Prevent duplicate parallel requests natively
                        retry: 1,
                    },
                },
            })
    )

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
