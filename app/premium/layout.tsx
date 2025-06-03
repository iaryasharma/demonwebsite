import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Premium Plans - Demon Bot | Unlock Advanced Features",
  description: "Upgrade to Demon Bot Premium for exclusive features, priority support, and enhanced capabilities. Choose from Prime ($5) or Pro ($9.99) plans.",
  keywords: [
    "Demon Bot premium",
    "Discord bot premium",
    "Discord bot subscription",
    "Demon Bot Pro",
    "Demon Bot Prime",
    "Discord bot features",
    "premium Discord bot"
  ],
  openGraph: {
    title: "Demon Bot Premium - Unlock Advanced Features",
    description: "Get access to exclusive features with Demon Bot Premium. Priority support, advanced moderation, and more.",
    url: "https://demonbot.vercel.app/premium",
    images: [
      {
        url: "/Demon-Prime.png",
        width: 1200,
        height: 630,
        alt: "Demon Bot Premium Plans",
      },
    ],
  },
  twitter: {
    title: "Demon Bot Premium - Advanced Discord Bot Features",
    description: "Unlock premium features with Demon Bot Pro and Prime plans. Enhanced moderation and exclusive tools.",
    images: ["/Demon-Prime.png"],
  },
}

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
