"use client"

import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

interface GuildInfo {
  id: string
  name: string
  icon: string | null
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const params = useParams()
  const guildId = params?.guildId as string | undefined
  const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null)

  // Fetch guild info for sidebar when viewing a specific guild
  useEffect(() => {
    if (!guildId || !session) return

    async function fetchGuild() {
      try {
        const res = await fetch("/api/guilds")
        if (res.ok) {
          const guilds = await res.json()
          const guild = guilds.find((g: GuildInfo) => g.id === guildId)
          if (guild) setGuildInfo(guild)
        }
      } catch { }
    }
    fetchGuild()
  }, [guildId, session])

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
      />
      <div className={`transition-all duration-300 lg:ml-64 pt-16 lg:pt-0 min-h-screen`}>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
