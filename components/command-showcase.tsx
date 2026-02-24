"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTerminal, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"

const commands = [
  {
    command: "/animesearch",
    description: "Search for anime information",
    example: "/animesearch query: Attack on Titan",
    category: "Anime",
    categoryColor: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  },
  {
    command: "/userinfo",
    description: "Get detailed user information",
    example: "/userinfo user: @DemonBot",
    category: "Utility",
    categoryColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    command: "/help",
    description: "Display all available commands",
    example: "/help category: moderation",
    category: "Info",
    categoryColor: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  {
    command: "/ban",
    description: "Ban a user from the server",
    example: "/ban user: @spammer reason: Spam",
    category: "Moderation",
    categoryColor: "text-red-400 bg-red-500/10 border-red-500/20",
  },
]

function TypingEffect({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("")

  useEffect(() => {
    setDisplayed("")
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [text])

  return (
    <span>
      {displayed}
      <span className="animate-pulse text-[#8b5cf6]">▌</span>
    </span>
  )
}

export function CommandShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const nextCommand = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % commands.length)
  }, [])

  const prevCommand = () => {
    setCurrentIndex((prev) => (prev - 1 + commands.length) % commands.length)
  }

  // Auto-rotate
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(nextCommand, 4000)
    return () => clearInterval(timer)
  }, [isPaused, nextCommand])

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#8b5cf6]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Command Preview
          </h2>
          <p className="text-lg text-gray-500">See Demon Bot&apos;s commands in action</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Terminal Window */}
          <div className="glass-dark rounded-2xl overflow-hidden">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-black/30">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs font-mono">
                <FontAwesomeIcon icon={faTerminal} className="h-3 w-3" />
                demon-bot-terminal
              </div>
              <div className="w-12" />
            </div>

            {/* Terminal Content */}
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevCommand}
                  className="p-2 rounded-lg text-gray-500 hover:text-[#8b5cf6] hover:bg-white/5 transition-all"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
                </motion.button>

                <div className="flex-1 mx-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndex}
                      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="text-center"
                    >
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mb-4 ${commands[currentIndex].categoryColor}`}>
                        {commands[currentIndex].category}
                      </span>

                      <div className="bg-black/40 rounded-xl p-5 font-mono border border-white/[0.04]">
                        <div className="text-[#a78bfa] text-lg font-bold mb-2">
                          {commands[currentIndex].command}
                        </div>
                        <div className="text-gray-500 text-sm mb-4">
                          {commands[currentIndex].description}
                        </div>
                        <div className="text-gray-300 bg-gray-900/60 rounded-lg p-3 text-sm border border-white/[0.04]">
                          <span className="text-gray-600 mr-2">$</span>
                          <TypingEffect text={commands[currentIndex].example} />
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextCommand}
                  className="p-2 rounded-lg text-gray-500 hover:text-[#8b5cf6] hover:bg-white/5 transition-all"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Dots */}
              <div className="flex justify-center space-x-2">
                {commands.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className="relative"
                    whileHover={{ scale: 1.2 }}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentIndex
                          ? "bg-[#8b5cf6] shadow-lg shadow-[#8b5cf6]/30"
                          : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
