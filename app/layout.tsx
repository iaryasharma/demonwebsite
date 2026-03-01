import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider"
import { SessionProvider } from "@/components/session-provider"
import { RootLayoutShell } from "@/components/root-layout-shell"
import QueryProvider from "@/components/providers/query-provider"
import { DevToolsShield } from "@/components/security/devtools-shield"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Demon Bot - Ultimate Discord Bot for Modern Communities",
    template: "%s | Demon Bot"
  },
  description: "Transform your Discord server with Demon Bot - the ultimate all-in-one Discord bot featuring advanced moderation, anime content, server utilities, and entertainment. Join thousands of communities using Demon Bot by FragNite.",
  keywords: [
    "Demon Bot Discord",
    "Demon Bot Fragnite",
    "Discord Bot",
    "Discord Moderation Bot",
    "Discord Anime Bot",
    "Discord Utility Bot",
    "Discord Entertainment Bot",
    "FragNite Discord Bot",
    "Best Discord Bot 2025",
    "Discord Server Management",
    "Discord Bot Commands",
    "Discord Community Bot"
  ],
  authors: [{ name: "Arya", url: "https://iaryasharma.me" }],
  creator: "Arya",
  publisher: "Arya",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === 'production'
        ? 'https://demonbot.vercel.app'
        : 'http://localhost:3000'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Demon Bot - Ultimate Discord Bot for Modern Communities",
    description: "Transform your Discord server with Demon Bot - advanced moderation, anime content, utilities, and entertainment all in one powerful bot.",
    url: "https://demonbot.vercel.app",
    siteName: "Demon Bot",
    images: [
      {
        url: "/demon-logo.png",
        width: 1200,
        height: 630,
        alt: "Demon Bot - Discord Bot by FragNite",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demon Bot - Ultimate Discord Bot",
    description: "Transform your Discord server with the ultimate all-in-one bot. Advanced moderation, anime content, and entertainment.",
    images: ["/demon-logo.png"],
    creator: "@iaryasharma",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'technology',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/demon-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/demon-logo.png" />
        <link rel="canonical" href="https://demonbot.vercel.app" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="application-name" content="Demon Bot" />
        <meta name="apple-mobile-web-app-title" content="Demon Bot" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Demon Bot",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Discord",
              "description": "Ultimate Discord bot for modern communities featuring advanced moderation, anime content, server utilities, and entertainment.",
              "url": "https://demonbot.vercel.app",
              "author": {
                "@type": "Person",
                "name": "Arya",
                "url": "https://iaryasharma.me"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "1000"
              },
              "featureList": [
                "Advanced Moderation",
                "Anime & Media Content",
                "Server Utilities",
                "Entertainment Hub",
                "99.9% Uptime",
                "24/7 Support"
              ]
            })
          }}
        />

        {/* Additional SEO Tags */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image:alt" content="Demon Bot - Discord Bot by FragNite" />

        {/* Preload critical resources */}
        <link rel="preload" href="/demon-logo.png" as="image" />
        <link rel="preload" href="/sky.mp4" as="video" type="video/mp4" />
      </head>
      <body suppressHydrationWarning className={`${inter.className} bg-black text-white overflow-x-hidden`}>
        <SessionProvider>
          <QueryProvider>
            <SmoothScrollProvider>
              <RootLayoutShell>{children}</RootLayoutShell>
            </SmoothScrollProvider>
          </QueryProvider>
        </SessionProvider>
        <DevToolsShield />
      </body>
    </html>
  )
}
