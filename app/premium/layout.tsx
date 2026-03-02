import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Premium",
  description: "Upgrade to Demon Bot Premium for exclusive features, priority support, and enhanced capabilities. Choose from Prime or Pro plans.",
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
    title: "Demon Bot - Premium",
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
    title: "Demon Bot - Premium",
    description: "Unlock premium features with Demon Bot Pro and Prime plans. Enhanced moderation and exclusive tools.",
    images: ["/Demon-Prime.png"],
  },
}

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const premiumSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Demon Bot Premium",
    "applicationCategory": "BusinessApplication",
    "description": "Premium features for Demon Bot including priority support, enhanced moderation, and exclusive utilities.",
    "operatingSystem": "Discord",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "3.50",
      "highPrice": "5.00",
      "offerCount": 2,
      "availability": "https://schema.org/InStock",
      "offers": [
        {
          "@type": "Offer",
          "name": "Demon Prime",
          "price": "3.50",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "name": "Demon Pro",
          "price": "5.00",
          "priceCurrency": "USD"
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(premiumSchema) }}
      />
      {children}
    </>
  )
}
