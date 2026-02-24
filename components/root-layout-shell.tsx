"use client"

import { usePathname } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export function RootLayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isDashboard = pathname?.startsWith("/dashboard")

    if (isDashboard) {
        return <>{children}</>
    }

    return (
        <>
            <Navigation />
            <main className="min-h-screen">{children}</main>
            <Footer />
        </>
    )
}
