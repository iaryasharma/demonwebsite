"use client"

import { useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import gsap from "gsap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDiscord } from "@fortawesome/free-brands-svg-icons"
import { faUsers, faHeadset, faHeart, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons"

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || !ref.current) return
    const obj = { val: 0 }
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = prefix + Math.floor(obj.val).toLocaleString() + suffix
        }
      },
    })
  }, [inView, target, suffix, prefix])

  return <span ref={ref}>{prefix}0{suffix}</span>
}

const bulletPoints = [
  { text: "Get help with bot setup and configuration", color: "bg-[#8b5cf6]" },
  { text: "Share feedback and feature requests", color: "bg-[#5865F2]" },
  { text: "Connect with other server owners", color: "bg-[#8b5cf6]" },
  { text: "Stay updated with announcements", color: "bg-[#5865F2]" },
]

export function DiscordWidget() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-black via-gray-950/50 to-black relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#5865F2]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#8b5cf6]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5865F2]/10 to-[#8b5cf6]/10 border border-[#5865F2]/20 rounded-full text-sm font-medium text-[#8b9ff2] backdrop-blur-sm">
              <FontAwesomeIcon icon={faDiscord} className="h-3.5 w-3.5" />
              Community Hub
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Join Our Growing Community
          </h2>
          <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
            Connect with other server owners, get instant support, share feedback, and stay updated with the latest features and announcements.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Community Stats */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid grid-cols-2 gap-5 mb-8">
              <div className="text-center p-6 glass rounded-2xl border border-[#5865F2]/10 hover:border-[#5865F2]/25 transition-all duration-300 group">
                <FontAwesomeIcon icon={faUsers} className="w-7 h-7 text-[#5865F2] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-white mb-1">
                  <AnimatedCounter target={5000} suffix="+" />
                </div>
                <div className="text-gray-500 text-sm">Active Members</div>
              </div>
              <div className="text-center p-6 glass rounded-2xl border border-[#8b5cf6]/10 hover:border-[#8b5cf6]/25 transition-all duration-300 group">
                <FontAwesomeIcon icon={faHeadset} className="w-7 h-7 text-[#8b5cf6] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-white mb-1">24/7</div>
                <div className="text-gray-500 text-sm">Support</div>
              </div>
            </div>

            <div className="text-left space-y-3">
              {bulletPoints.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  className="flex items-center text-gray-400"
                >
                  <div className={`w-1.5 h-1.5 ${point.color} rounded-full mr-3 flex-shrink-0`} />
                  <span className="text-sm">{point.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Discord Server Widget */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5865F2]/15 to-[#8b5cf6]/15 rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm rounded-2xl p-8 border border-[#5865F2]/15 hover:border-[#5865F2]/30 transition-all duration-500 group">
                <div className="mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-16 h-16 bg-gradient-to-br from-[#5865F2] to-[#4752C4] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#5865F2]/20"
                  >
                    <FontAwesomeIcon icon={faDiscord} className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Demon Bot Official</h3>
                  <div className="flex items-center justify-center text-gray-500 text-sm mb-4">
                    <div className="w-2 h-2 bg-[#8b5cf6] rounded-full mr-2 animate-pulse" />
                    <span>1,234 members online</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                    Official support server for Demon Bot. Get help, share feedback, and connect with our community!
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    window.open(
                      "https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20applications.commands&permissions=1513962695871",
                      "_blank"
                    )
                  }
                  className="w-full bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#4752C4] hover:to-[#3C45A5] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#5865F2]/20 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-4 h-4 mr-2" />
                  Join Community Server
                </motion.button>

                <div className="mt-4 flex items-center justify-center text-xs text-gray-600">
                  <FontAwesomeIcon icon={faHeart} className="w-3 h-3 mr-1 text-red-400/60" />
                  <span>Trusted by many servers</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
