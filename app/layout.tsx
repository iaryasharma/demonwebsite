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

const BASE_URL =
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === "production"
      ? "https://demonbot.vercel.app"
      : "http://localhost:3000"

export const metadata: Metadata = {
  title: {
    default: "Demon Bot",
    template: "Demon Bot - %s",
  },
  description:
    "Demon Bot is the all-in-one multipurpose Discord bot built by Arya Sharma (FragNite). Powerful moderation, anime, giveaways, server utilities & entertainment. Invite Demon Bot dc to your Discord server now.",
  keywords: [
    // Primary brand keywords
    "Demon Bot",
    "Demon Bot Discord",
    "Demon Bot dc",
    "Demon Bot Fragnite",
    "Demon Bot by Arya Sharma",
    "demon bot discord bot",
    "demon bot invite",
    "demon bot commands",
    "demon bot multipurpose",
    // Developer / creator keywords
    "Arya Sharma",
    "Arya Sharma Discord",
    "Arya Sharma Discord developer",
    "Arya Sharma developer",
    "iaryasharma",
    "FragNite",
    "FragNite developer",
    "FragNite Discord developer",
    "FragNite Discord bot developer",
    "fragnite discord",
    // Feature / category keywords
    "discord multipurpose bot",
    "discord moderation bot",
    "moderation bot",
    "multipurpose discord bot",
    "best multipurpose discord bot",
    "Discord bot",
    "best Discord bot 2025",
    "Discord anime bot",
    "Discord utility bot",
    "Discord entertainment bot",
    "Discord giveaway bot",
    "Discord server management",
    "Discord bot commands",
    "Discord community bot",
    "Discord all-in-one bot",
    "free Discord bot",
    "Discord bot invite",
    "Discord bot dashboard",
    "discord bot multipurpose free",
    "discord server moderation",
  ],
  authors: [{ name: "Arya Sharma", url: "https://iaryasharma.me" }],
  creator: "Arya Sharma",
  publisher: "Arya Sharma",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Demon Bot — Ultimate Multipurpose Discord Bot by Arya Sharma (FragNite)",
    description:
      "Demon Bot is the all-in-one multipurpose Discord bot built by Arya Sharma (FragNite). Advanced moderation, anime content, giveaways, utilities and entertainment — all in one powerful bot.",
    url: "https://demonbot.vercel.app",
    siteName: "Demon Bot",
    images: [
      {
        url: "/demon-logo.png",
        width: 1200,
        height: 630,
        alt: "Demon Bot — Discord Bot by Arya Sharma (FragNite)",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demon Bot — Multipurpose Discord Bot by Arya Sharma (FragNite)",
    description:
      "The all-in-one multipurpose Discord bot by Arya Sharma (FragNite). Moderation, anime, giveaways, utilities & more. Invite Demon Bot today!",
    images: ["/demon-logo.png"],
    creator: "@iaryasharma",
    site: "@iaryasharma",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? "your-google-verification-code",
  },
  category: "technology",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLdSchemas = [
    // 1. SoftwareApplication — the bot itself
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "@id": "https://demonbot.vercel.app/#app",
      name: "Demon Bot",
      alternateName: ["Demon Bot Discord", "Demon Bot dc", "Demon Bot Fragnite"],
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Discord Bot",
      operatingSystem: "Discord",
      description:
        "Demon Bot is the ultimate all-in-one Discord bot for modern communities, featuring advanced moderation, anime content, server utilities, giveaways, and entertainment. Developed by Arya Sharma (FragNite).",
      url: "https://demonbot.vercel.app",
      sameAs: [
        "https://discord.com/oauth2/authorize?client_id=906513888088444962",
      ],
      author: {
        "@type": "Person",
        "@id": "https://iaryasharma.me/#person",
        name: "Arya Sharma",
        alternateName: ["FragNite", "iaryasharma"],
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "1000",
      },
      featureList: [
        "Advanced Moderation",
        "Anime & Media Content",
        "Server Utilities",
        "Giveaway Management",
        "Entertainment Hub",
        "99.9% Uptime",
        "Dashboard Control Panel",
      ],
    },
    // 2. Person — Arya Sharma / FragNite (Google Knowledge Panel signal)
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": "https://iaryasharma.me/#person",
      name: "Arya Sharma",
      alternateName: ["FragNite", "iaryasharma", "Arya Sharma Discord developer", "FragNite developer"],
      url: "https://iaryasharma.me",
      jobTitle: "Discord Bot Developer",
      description:
        "Arya Sharma, known online as FragNite, is a Discord bot developer and the creator of Demon Bot — a feature-rich all-in-one Discord bot used by thousands of communities.",
      sameAs: [
        "https://iaryasharma.me",
        "https://github.com/iaryasharma",
        "https://demonbot.vercel.app",
      ],
      knowsAbout: [
        "Discord Bot Development",
        "JavaScript",
        "Node.js",
        "Next.js",
        "Web Development",
      ],
      worksFor: {
        "@type": "Organization",
        name: "FragNite",
        url: "https://demonbot.vercel.app",
      },
    },
    // 3. WebSite schema with SearchAction (Google Sitelinks Searchbox)
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://demonbot.vercel.app/#website",
      name: "Demon Bot",
      url: "https://demonbot.vercel.app",
      description:
        "Official website of Demon Bot — the ultimate Discord bot by Arya Sharma (FragNite).",
      publisher: { "@id": "https://iaryasharma.me/#person" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://demonbot.vercel.app/commands?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    // 4. BreadcrumbList — site structure signal
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://demonbot.vercel.app" },
        { "@type": "ListItem", position: 2, name: "Commands", item: "https://demonbot.vercel.app/commands" },
        { "@type": "ListItem", position: 3, name: "Premium", item: "https://demonbot.vercel.app/premium" },
      ],
    },
    // 5. FAQPage — rich result for common questions
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Who made Demon Bot?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Demon Bot was created by Arya Sharma, also known as FragNite. He is a Discord bot developer from India.",
          },
        },
        {
          "@type": "Question",
          name: "What is Demon Bot?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Demon Bot is an all-in-one Discord bot featuring advanced moderation, anime content, giveaways, server utilities, and entertainment features. It is free to invite to any Discord server.",
          },
        },
        {
          "@type": "Question",
          name: "What is Demon Bot dc?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Demon Bot dc (also written as Demon Bot Discord) refers to Demon Bot — the Discord bot created by Arya Sharma (FragNite). 'dc' is short for Discord.",
          },
        },
        {
          "@type": "Question",
          name: "Who is FragNite?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "FragNite is the online alias of Arya Sharma, a Discord bot developer and the creator of Demon Bot.",
          },
        },
        {
          "@type": "Question",
          name: "How do I invite Demon Bot to my Discord server?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can invite Demon Bot by visiting demonbot.vercel.app and clicking the 'Invite Bot' button, or by using the official Discord OAuth invite link.",
          },
        },
      ],
    },
  ]

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
        {/* Secondary description targeting "Demon Bot dc" short-form keyword */}
        <meta
          name="description"
          content="Demon Bot dc — the #1 all-in-one Discord bot by Arya Sharma (FragNite). Advanced moderation, anime, giveaways, utilities & entertainment. Invite now!"
        />
        <meta name="author" content="Arya Sharma (FragNite)" />

        {/* All JSON-LD structured data schemas */}
        {jsonLdSchemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}

        {/* Additional OG tags */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image:alt" content="Demon Bot — Discord Bot by Arya Sharma (FragNite)" />

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
