"use client"

import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar"

interface GuildInfo {
  id: string
  name: string
  icon: string | null
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const params = useParams()
  const guildId = params?.guildId as string | undefined
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const { data: guilds } = useQuery({
    queryKey: ["guilds"],
    queryFn: async () => {
      const res = await fetch("/api/guilds")
      if (!res.ok) throw new Error("Failed to fetch guilds")
      return res.json()
    },
    enabled: !!session && !!guildId,
  })

  const guildInfo = guilds?.find((g: GuildInfo) => g.id === guildId) || null

  // Don't render sidebar for unauthenticated users (login screen)
  if (status === "unauthenticated" || status === "loading") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar
        guildId={guildId}
        guildName={guildInfo?.name}
        guildIcon={guildInfo?.icon}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-64"} min-h-screen flex flex-col`}>
        <DashboardNavbar />
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
