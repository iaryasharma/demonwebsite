"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"

const slideFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}

const slideFromRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}

/** Realistic Discord-style message bubble */
function DiscordMessage({
  avatarSrc,
  username,
  usernameColor = "text-[#a78bfa]",
  botBadge = false,
  timestamp,
  children,
}: {
  avatarSrc: string
  username: string
  usernameColor?: string
  botBadge?: boolean
  timestamp?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3 group/msg hover:bg-white/[0.015] px-2 py-1 -mx-2 rounded-lg transition-colors">
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        <Image src={avatarSrc} alt={username} width={36} height={36} className="rounded-full" />
      </div>
      <div className="flex-1 min-w-0">
        {/* Username row */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[13px] font-semibold ${usernameColor}`}>{username}</span>
          {botBadge && (
            <span className="text-[9px] font-bold bg-[#5865F2] text-white px-1.5 py-0.5 rounded-sm tracking-wider">BOT</span>
          )}
          {timestamp && (
            <span className="text-[11px] text-zinc-600">{timestamp}</span>
          )}
        </div>
        {/* Message content */}
        <div className="text-[13px] leading-snug">{children}</div>
      </div>
    </div>
  )
}

/** Discord embed component */
function DiscordEmbed({
  accentColor,
  children,
}: {
  accentColor: string
  children: React.ReactNode
}) {
  return (
    <div className={`ml-1 mt-1 flex rounded-r-lg overflow-hidden border border-white/[0.04] bg-[#2b2d31]`}>
      <div className={`w-1 flex-shrink-0 ${accentColor}`} />
      <div className="flex-1 px-3 py-2.5">{children}</div>
    </div>
  )
}

export function FeatureShowcase() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative">
      <div className="max-w-7xl mx-auto relative z-10 pt-8">

        {/* ─── Badge System ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">

          {/* Discord UI mockup */}
          <motion.div variants={slideFromLeft} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="order-2 lg:order-1">
            {/* Discord channel panel */}
            <div className="bg-[#313338] rounded-2xl overflow-hidden border border-white/[0.05] shadow-xl shadow-black/40">
              {/* Channel header */}
              <div className="bg-[#313338] border-b border-black/30 px-4 py-3 flex items-center gap-2">
                <span className="text-zinc-400 text-base font-semibold">#</span>
                <span className="text-white text-sm font-semibold">general</span>
              </div>
              {/* Messages */}
              <div className="bg-[#313338] p-4 space-y-3">
                {/* User command */}
                <DiscordMessage avatarSrc="/arya.png" username="ARYA" usernameColor="text-yellow-300" timestamp="Today at 11:47 AM">
                  <span className="text-zinc-300">!!badge @Mr. Frag Nite</span>
                </DiscordMessage>

                {/* Bot embed reply */}
                <DiscordMessage avatarSrc="/demon.png" username="DEMON" botBadge usernameColor="text-white" timestamp="Today at 11:47 AM">
                  <DiscordEmbed accentColor="bg-[#8b5cf6]">
                    <div className="flex items-center gap-2 mb-2">
                      <Image src="/arya.png" alt="User" width={20} height={20} className="rounded-full" />
                      <span className="text-white text-xs font-semibold">Mr. Frag Nite&apos;s Badges</span>
                    </div>
                    <div className="space-y-1 mb-2">
                      {[
                        { label: "OWNER", color: "text-[#8b5cf6]", bg: "bg-[#8b5cf6]/10" },
                        { label: "DEVELOPER", color: "text-[#a78bfa]", bg: "bg-[#a78bfa]/10" },
                        { label: "DEVELOPER TEAM", color: "text-zinc-300", bg: "bg-white/5" },
                        { label: "ONE AND ONLY ONE", color: "text-zinc-400", bg: "bg-white/5" },
                      ].map((b, i) => (
                        <div key={i} className={`inline-flex mr-1.5 items-center px-2 py-0.5 rounded ${b.bg}`}>
                          <span className={`${b.color} text-[10px] font-bold`}>{b.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-zinc-500">Total badges: 4</div>
                  </DiscordEmbed>
                </DiscordMessage>
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div variants={slideFromRight} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="order-1 lg:order-2">
            <p className="text-xs font-bold tracking-[0.3em] text-[#8b5cf6] uppercase mb-4">Recognition</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white">Show off your Badges!</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed text-base">
              Earn exclusive badges by contributing to the community and helping us improve the bot. Display your achievements and stand out.
            </p>
            <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400 }}>
              <Button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium px-6 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-[#8b5cf6]/20 border-0 rounded-xl group cursor-pointer">
                Learn More
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* ─── Anime Search ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">

          {/* Text */}
          <motion.div variants={slideFromLeft} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <p className="text-xs font-bold tracking-[0.3em] text-[#8b5cf6] uppercase mb-4">Anime</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white">Track Airing Anime!</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed text-base">
              Get comprehensive anime info including episodes, ratings, scores, and air dates. Perfect for anime enthusiasts in your server.
            </p>
            <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400 }}>
              <Button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium px-6 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-[#8b5cf6]/20 border-0 rounded-xl group cursor-pointer">
                Learn More
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Discord UI */}
          <motion.div variants={slideFromRight} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <div className="bg-[#313338] rounded-2xl overflow-hidden border border-white/[0.05] shadow-xl shadow-black/40">
              <div className="bg-[#313338] border-b border-black/30 px-4 py-3 flex items-center gap-2">
                <span className="text-zinc-400 text-base font-semibold">#</span>
                <span className="text-white text-sm font-semibold">anime</span>
              </div>
              <div className="bg-[#313338] p-4 space-y-3">
                <DiscordMessage avatarSrc="/arya.png" username="ARYA" usernameColor="text-yellow-300" timestamp="05/26/2022">
                  <span className="text-zinc-300">!!anime Attack on Titan</span>
                </DiscordMessage>
                <DiscordMessage avatarSrc="/demon.png" username="DEMON" botBadge usernameColor="text-white" timestamp="05/26/2022">
                  <DiscordEmbed accentColor="bg-[#8b5cf6]">
                    <div className="text-[#a78bfa] font-semibold text-xs mb-2">MyAnimeList — Attack on Titan</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-2">
                      {[
                        ["English", "Attack on Titan"],
                        ["Japanese", "進撃の巨人"],
                        ["Type", "TV Series"],
                        ["Episodes", "25"],
                        ["Score", "8.53 ⭐"],
                        ["Aired", "Apr 7 – Sep 29, 2013"],
                      ].map(([label, value], i) => (
                        <div key={i}>
                          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</div>
                          <div className="text-[11px] text-zinc-200 font-medium truncate">{value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-[#8b5cf6] hover:underline cursor-pointer truncate mt-1">
                      https://myanimelist.net/anime/16498/Shingeki_no_Kyojin
                    </div>
                  </DiscordEmbed>
                </DiscordMessage>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Help / Commands ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Discord UI */}
          <motion.div variants={slideFromLeft} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <div className="bg-[#313338] rounded-2xl overflow-hidden border border-white/[0.05] shadow-xl shadow-black/40">
              <div className="bg-[#313338] border-b border-black/30 px-4 py-3 flex items-center gap-2">
                <span className="text-zinc-400 text-base font-semibold">#</span>
                <span className="text-white text-sm font-semibold">bot-commands</span>
              </div>
              <div className="bg-[#313338] p-4 space-y-3">
                <DiscordMessage avatarSrc="/arya.png" username="ARYA" usernameColor="text-yellow-300" timestamp="Today at 12:20 PM">
                  <span className="text-zinc-300">!!help</span>
                </DiscordMessage>
                <DiscordMessage avatarSrc="/demon.png" username="DEMON" botBadge usernameColor="text-white" timestamp="Today at 12:20 PM">
                  <DiscordEmbed accentColor="bg-[#8b5cf6]">
                    <div className="text-white font-bold text-xs mb-1">📖 DEMON Help Menu</div>
                    <div className="text-zinc-400 text-[11px] mb-2">Prefix: <code className="bg-zinc-700/60 px-1.5 py-0.5 rounded text-[#a78bfa]">!!</code></div>
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      {[
                        "🛡️ Moderation",
                        "🎮 Fun",
                        "🎵 Music",
                        "🎨 Utility",
                        "🎁 Giveaway",
                        "🔒 Security",
                      ].map((cat, i) => (
                        <div key={i} className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                          <span>{cat}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/[0.06] pt-1.5 flex gap-3 text-[10px] text-[#8b5cf6]">
                      <span className="hover:underline cursor-pointer">Get Demon</span>
                      <span>|</span>
                      <span className="hover:underline cursor-pointer">Support Server</span>
                    </div>
                  </DiscordEmbed>
                </DiscordMessage>
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div variants={slideFromRight} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <p className="text-xs font-bold tracking-[0.3em] text-[#8b5cf6] uppercase mb-4">Commands</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white">Multiple Command Categories</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed text-base">
              Explore our extensive collection of commands organized into intuitive categories for seamless server management and entertainment.
            </p>
            <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400 }}>
              <Button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium px-6 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-[#8b5cf6]/20 border-0 rounded-xl group cursor-pointer">
                View All Commands
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
