import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Development Team - Demon Bot | Meet the FragNite Developers",
  description: "Meet the talented development team behind Demon Bot. Learn about the FragNite developers who created the ultimate Discord bot experience.",
  keywords: [
    "Demon Bot team",
    "FragNite developers",
    "Discord bot developers",
    "Demon Bot creators",
    "FragNite team",
    "Discord bot development"
  ],
  openGraph: {
    title: "Demon Bot Development Team - FragNite",
    description: "Meet the talented developers behind Demon Bot. The FragNite team creating amazing Discord experiences.",
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
    title: "Meet the Demon Bot Team - FragNite Developers",
    description: "Discover the talented team behind Demon Bot and their passion for Discord community building.",
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
