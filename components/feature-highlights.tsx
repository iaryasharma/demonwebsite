"use client"

import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faShieldHalved, faHeart, faWrench, faGamepad } from "@fortawesome/free-solid-svg-icons"
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"

const features: { icon: IconDefinition; title: string; description: string; gradient: string }[] = [
  {
    icon: faShieldHalved,
    title: "Moderation",
    description: "Advanced moderation tools with auto-mod, warnings, and comprehensive logging.",
    gradient: "from-red-500/20 to-orange-500/10",
  },
  {
    icon: faHeart,
    title: "Anime",
    description: "Search anime, manga, characters, and get random recommendations.",
    gradient: "from-pink-500/20 to-rose-500/10",
  },
  {
    icon: faWrench,
    title: "Utilities",
    description: "Server management, user info, polls, and productivity commands.",
    gradient: "from-blue-500/20 to-cyan-500/10",
  },
  {
    icon: faGamepad,
    title: "Fun",
    description: "Games, memes, random facts, and entertainment for your server.",
    gradient: "from-yellow-500/20 to-amber-500/10",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function FeatureHighlights() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8b5cf6]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Everything you need to manage and entertain your Discord server
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
              <div className="relative glass rounded-2xl p-6 text-center h-full hover:border-[#8b5cf6]/20 transition-all duration-300">
                <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-gradient-to-br from-[#8b5cf6]/10 to-[#7c3aed]/10 flex items-center justify-center group-hover:from-[#8b5cf6]/20 group-hover:to-[#7c3aed]/20 transition-all duration-300">
                  <FontAwesomeIcon
                    icon={feature.icon}
                    className="h-6 w-6 text-[#a78bfa] group-hover:text-[#8b5cf6] transition-colors duration-300"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
