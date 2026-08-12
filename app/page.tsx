import { HeroSection } from "@/components/hero-section"
import dynamic from "next/dynamic"

const FeatureHighlights = dynamic(() =>
  import("@/components/feature-highlights").then(m => m.FeatureHighlights),
)
const FeatureShowcase = dynamic(() =>
  import("@/components/feature-showcase").then(m => m.FeatureShowcase),
)
const CommandShowcase = dynamic(() =>
  import("@/components/command-showcase").then(m => m.CommandShowcase),
)
const DiscordWidget = dynamic(() =>
  import("@/components/discord-widget").then(m => m.DiscordWidget),
)

export default function HomePage() {
  return (
    <div className="relative">
      <HeroSection />
      <FeatureHighlights />
      <FeatureShowcase />
      <CommandShowcase />
      <DiscordWidget />
    </div>
  )
}
