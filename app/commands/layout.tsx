import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Demon Bot Commands | Complete Command List & Docs",
  description: "Explore Demon Bot's comprehensive command library. Find moderation, anime, utility, and fun commands with detailed usage examples. Over 100+ commands available.",
  keywords: [
    "Demon Bot commands",
    "Discord bot commands",
    "moderation commands",
    "anime commands",
    "utility commands",
    "Discord bot help",
    "Demon Bot documentation",
    "Discord server management"
  ],
  openGraph: {
    title: "Demon Bot Commands - Complete List & Documentation",
    description: "Discover all of Demon Bot's powerful commands. Moderation, anime, utilities, and entertainment - all documented with examples.",
    url: "https://demonbot.vercel.app/commands",
    images: [
      {
        url: "/help.png",
        width: 1200,
        height: 630,
        alt: "Demon Bot Commands Documentation",
      },
    ],
  },
  twitter: {
    title: "Demon Bot Commands - Complete Documentation",
    description: "Discover all of Demon Bot's powerful commands. Moderation, anime, utilities, and entertainment commands.",
    images: ["/help.png"],
  },
}

export default function CommandsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
