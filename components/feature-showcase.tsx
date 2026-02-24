"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faTrophy, faFilm, faBolt } from "@fortawesome/free-solid-svg-icons"

const slideFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}

const slideFromRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}

export function FeatureShowcase() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-950 to-black relative">
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#8b5cf6]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-[300px] h-[300px] bg-[#7c3aed]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Badges Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            variants={slideFromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="order-2 lg:order-1"
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06] hover:border-[#8b5cf6]/20 transition-all duration-500 group">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <Image src="/demon-logo.png" alt="Demon Bot" width={48} height={48} className="rounded-full" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm">@ARYA !!badge @Mr. Frag Nite</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Image src="/demon-logo.png" alt="Demon Bot" width={24} height={24} className="rounded-full mr-2" />
                    <span className="text-white font-semibold">DEMON</span>
                    <Badge className="ml-2 bg-[#5865F2]/20 text-[#8b9ff2] text-xs border border-[#5865F2]/20">BOT</Badge>
                    <span className="text-gray-600 text-xs ml-2">Today at 11:47 AM</span>
                  </div>
                  <div className="mt-4 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/[0.04]">
                    <div className="flex items-center mb-3">
                      <Image src="/demon-logo.png" alt="Demon Bot" width={24} height={24} className="rounded-full mr-2" />
                      <span className="text-white font-medium">Mr. Frag Nite&apos;s Badges</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "> OWNER", color: "text-[#8b5cf6]" },
                        { label: "DEVELOPER", color: "text-blue-400" },
                        { label: "DEVELOPER TEAM", color: "text-purple-400" },
                        { label: "ONE AND ONLY ONE", color: "text-pink-400" },
                        { label: "MOST SPECIAL", color: "text-yellow-400" },
                      ].map((badge, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 * i, duration: 0.4 }}
                          className="flex items-center"
                        >
                          <span className={`${badge.color} font-semibold text-sm`}>{badge.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={slideFromRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="order-1 lg:order-2"
          >
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8b5cf6]/10 to-[#7c3aed]/10 border border-[#8b5cf6]/20 rounded-full text-sm font-medium text-[#a78bfa] backdrop-blur-sm">
                <FontAwesomeIcon icon={faTrophy} className="h-3.5 w-3.5" />
                Recognition System
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Show off your Badges!
            </h2>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Earn exclusive badges by contributing to the community and helping us improve the bot. Display your achievements and stand out among your peers.
            </p>
            <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400 }}>
              <Button className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-medium px-6 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-[#8b5cf6]/20 border-0 group">
                Learn More
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Anime Search Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            variants={slideFromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-full text-sm font-medium text-pink-400 backdrop-blur-sm">
                <FontAwesomeIcon icon={faFilm} className="h-3.5 w-3.5" />
                Anime Database
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Track Airing Anime!
            </h2>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Get comprehensive anime information including episode counts, ratings, scores, and air dates. Perfect for anime enthusiasts in your server.
            </p>
            <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400 }}>
              <Button className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-medium px-6 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-[#8b5cf6]/20 border-0 group">
                Learn More
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={slideFromRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06] hover:border-pink-500/20 transition-all duration-500">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <Image src="/demon-logo.png" alt="Demon Bot" width={48} height={48} className="rounded-full" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-white font-semibold">DEMON</span>
                    <Badge className="ml-2 bg-[#5865F2]/20 text-[#8b9ff2] text-xs border border-[#5865F2]/20">BOT</Badge>
                    <span className="text-gray-600 text-xs ml-2">05/26/2022</span>
                  </div>
                  <div className="mt-4 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/[0.04]">
                    <div className="text-[#a78bfa] font-semibold mb-4 text-sm">
                      My Anime List search result for Attack On Titan
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        {[
                          ["English Title", "Attack on Titan"],
                          ["Japanese Title", "進撃の巨人"],
                          ["Type", "TV"],
                          ["Episodes", "25"],
                        ].map(([label, value], i) => (
                          <div key={i}>
                            <span className="text-gray-600 text-xs block">{label}</span>
                            <div className="text-white font-medium text-sm">{value}</div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        {[
                          ["Rating", "R-17+ (violence & profanity)"],
                          ["Aired", "Apr 7, 2013 to Sep 29, 2013"],
                          ["Score", "8.53"],
                          ["Score Stats", "scored by 2,441,808 users"],
                        ].map(([label, value], i) => (
                          <div key={i}>
                            <span className="text-gray-600 text-xs block">{label}</span>
                            <div className="text-white font-medium text-sm">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/[0.04]">
                      <span className="text-gray-600 text-xs block mb-1">Link</span>
                      <div className="text-[#8b5cf6] text-sm break-all hover:underline cursor-pointer">
                        https://myanimelist.net/anime/16498/Shingeki_no_Kyojin
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Command Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={slideFromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06] hover:border-blue-500/20 transition-all duration-500">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <Image src="/demon-logo.png" alt="Demon Bot" width={48} height={48} className="rounded-full" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-white font-semibold">DEMON</span>
                    <Badge className="ml-2 bg-[#5865F2]/20 text-[#8b9ff2] text-xs border border-[#5865F2]/20">BOT</Badge>
                    <span className="text-gray-600 text-xs ml-2">Today at 12:20 PM</span>
                  </div>
                  <div className="mt-4 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/[0.04]">
                    <div className="text-white font-semibold mb-3 text-sm">DEMON Help Menu</div>
                    <ul className="space-y-2 text-gray-400 text-sm">
                      <li className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full mr-3 flex-shrink-0" />
                        My prefix is !!
                      </li>
                      <li className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full mr-3 flex-shrink-0" />
                        <span className="text-[#8b5cf6] hover:underline cursor-pointer">Get Demon</span>
                        <span className="mx-1">|</span>
                        <span className="text-[#8b5cf6] hover:underline cursor-pointer">Support server</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full mr-3 mt-1.5 flex-shrink-0" />
                        Type: <code className="text-gray-500 bg-gray-800/60 px-2 py-0.5 rounded text-xs ml-1">!!help &lt;command | module&gt;</code> for more info.
                      </li>
                    </ul>
                    <div className="mt-4 pt-3 border-t border-white/[0.06]">
                      <div className="text-white font-semibold mb-2 text-sm">MAIN COMMANDS</div>
                      <div className="w-full h-1 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={slideFromRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-full text-sm font-medium text-blue-400 backdrop-blur-sm">
                <FontAwesomeIcon icon={faBolt} className="h-3.5 w-3.5" />
                Command Center
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Multiple Command Categories
            </h2>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Explore our extensive collection of commands organized into intuitive categories for seamless server management and entertainment.
            </p>
            <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400 }}>
              <Button className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-medium px-6 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-[#8b5cf6]/20 border-0 group">
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
