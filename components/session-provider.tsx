"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({ children }: { children: React.ReactNode }) {
    // One session request per page load. No refetch on every tab focus (that hammered /api/auth/session);
    // a slow heartbeat keeps the Discord access token fresh instead.
    return (
        <NextAuthSessionProvider refetchOnWindowFocus={false} refetchInterval={30 * 60} refetchWhenOffline={false}>
            {children}
        </NextAuthSessionProvider>
    )
}
