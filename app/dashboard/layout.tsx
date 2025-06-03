import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - Demon Bot | Server Management (Coming Soon)",
  description: "Access your Discord server's Demon Bot dashboard for advanced configuration, analytics, and management tools. Feature coming soon!",
  keywords: [
    "Demon Bot dashboard",
    "Discord bot dashboard",
    "server management",
    "Discord bot configuration",
    "bot analytics",
    "server settings"
  ],
  openGraph: {
    title: "Demon Bot Dashboard - Server Management",
    description: "Manage your Discord server with Demon Bot's powerful dashboard. Advanced configuration and analytics coming soon.",
    url: "https://demonbot.vercel.app/dashboard",
  },
  twitter: {
    title: "Demon Bot Dashboard - Coming Soon",
    description: "Advanced server management dashboard for Demon Bot is in development. Stay tuned for powerful features!",
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
