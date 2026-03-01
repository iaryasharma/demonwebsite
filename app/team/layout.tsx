import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the passionate developers behind Demon Bot — Arya Sharma (FragNite) and the Demon development team dedicated to creating the best Discord bot experience.",
  keywords: [
    "Demon Bot team",
    "FragNite developers",
    "Discord bot developers",
    "Demon Bot creators",
    "FragNite team",
    "Discord bot development"
  ],
  openGraph: {
    title: "Demon Bot - Team",
    description: "Meet the passionate developers behind Demon Bot — Arya Sharma (FragNite).",
    url: "https://demonbot.vercel.app/team",
    images: [
      {
        url: "/Fragnite.jpg",
        width: 1200,
        height: 630,
        alt: "Demon Bot Development Team",
      },
    ],
  },
  twitter: {
    title: "Demon Bot - Team",
    description: "Meet the developers behind Demon Bot — built by Arya Sharma (FragNite).",
    images: ["/Fragnite.jpg"],
  },
}

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
