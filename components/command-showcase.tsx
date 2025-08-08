"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const commands = [
  {
    command: "/animesearch",
    description: "Search for anime information",
    example: "/animesearch query: Attack on Titan",
    category: "Anime",
  },
  {
    command: "/userinfo",
    description: "Get detailed user information",
    example: "/userinfo user: @DemonBot",
    category: "Utility",
  },
  {
    command: "/help",
    description: "Display all available commands",
    example: "/help category: moderation",
    category: "Info",
  },
  {
    command: "/ban",
    description: "Ban a user from the server",
    example: "/ban user: @spammer reason: Spam",
    category: "Moderation",
  },
]

export function CommandShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextCommand = () => {
    setCurrentIndex((prev) => (prev + 1) % commands.length)
  }

  const prevCommand = () => {
    setCurrentIndex((prev) => (prev - 1 + commands.length) % commands.length)
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-black/20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 neon-text">Command Preview</h2>
          <p className="text-xl text-gray-400">See Demon Bot's commands in action</p>
        </div>

        <div className="relative">
          <Card className="glass-dark border-[#8b5cf6]/30">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevCommand}
                  className="text-[#8b5cf6] hover:bg-[#8b5cf6]/10"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="text-center flex-1">
                  <span className="inline-block px-3 py-1 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded-full text-sm font-medium mb-4">
                    {commands[currentIndex].category}
                  </span>
                  <div className="bg-[#2f3136] rounded-lg p-4 font-mono">
                    <div className="text-[#8b5cf6] text-lg font-bold mb-2">{commands[currentIndex].command}</div>
                    <div className="text-gray-400 text-sm mb-3">{commands[currentIndex].description}</div>
                    <div className="text-gray-300 bg-[#40444b] rounded p-2 text-sm">
                      {commands[currentIndex].example}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextCommand}
                  className="text-[#8b5cf6] hover:bg-[#8b5cf6]/10"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex justify-center space-x-2">
                {commands.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentIndex ? "bg-[#8b5cf6]" : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
