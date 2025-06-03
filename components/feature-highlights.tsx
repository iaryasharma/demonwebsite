"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Shield, Heart, Wrench, Gamepad2 } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Moderation",
    description: "Advanced moderation tools with auto-mod, warnings, and comprehensive logging.",
    color: "text-red-400",
  },
  {
    icon: Heart,
    title: "Anime",
    description: "Search anime, manga, characters, and get random recommendations.",
    color: "text-pink-400",
  },
  {
    icon: Wrench,
    title: "Utilities",
    description: "Server management, user info, polls, and productivity commands.",
    color: "text-blue-400",
  },
  {
    icon: Gamepad2,
    title: "Fun",
    description: "Games, memes, random facts, and entertainment for your server.",
    color: "text-yellow-400",
  },
]

export function FeatureHighlights() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 neon-text">Powerful Features</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to manage and entertain your Discord server
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="glass hover:glow-green transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <feature.icon
                  className={`h-12 w-12 mx-auto mb-4 ${feature.color} group-hover:text-[#00FF85] transition-colors`}
                />
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
