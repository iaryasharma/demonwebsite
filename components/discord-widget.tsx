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
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#5865F2]/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#8b5cf6]/[0.06] rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold tracking-[0.3em] text-[#8b5cf6] uppercase mb-5">Community</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            Join Our Growing Community
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-base">
            Connect with other server owners, get help, share feedback, and stay updated.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Community Stats */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="relative group p-6 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-[#5865F2]/20 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5865F2]/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <FontAwesomeIcon icon={faUsers} className="w-6 h-6 text-[#5865F2] mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  <AnimatedCounter target={5000} suffix="+" />
                </div>
                <div className="text-zinc-500 text-sm">Active Members</div>
              </div>
              <div className="relative group p-6 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-[#8b5cf6]/20 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <FontAwesomeIcon icon={faHeadset} className="w-6 h-6 text-[#8b5cf6] mb-3" />
                <div className="text-3xl font-bold text-white mb-1">24/7</div>
                <div className="text-zinc-500 text-sm">Support</div>
              </div>
            </div>

            <div className="space-y-3">
              {bulletPoints.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  className="flex items-center gap-3 text-zinc-400 text-sm"
                >
                  <div className={`w-1.5 h-1.5 ${point.color} rounded-full flex-shrink-0`} />
                  {point.text}
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
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5865F2]/20 to-[#8b5cf6]/10 rounded-3xl blur-xl" />
              <div className="relative bg-zinc-900/60 backdrop-blur-md rounded-3xl p-8 border border-white/[0.06] group-hover:border-[#5865F2]/20 transition-all duration-500">
                {/* Online indicator bar */}
                <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#5865F2] rounded-xl flex items-center justify-center shadow-lg shadow-[#5865F2]/20">
                      <FontAwesomeIcon icon={faDiscord} className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">Demon Bot Official</div>
                      <div className="text-zinc-500 text-xs">Support Server</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-zinc-400">1,234 online</span>
                  </div>
                </div>

                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Official support server for Demon Bot. Get help, share feedback, and connect with thousands of community members.
                </p>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open("https://discord.gg/demonbot", "_blank")}
                  className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#5865F2]/20 flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-3.5 h-3.5" />
                  Join Community Server
                </motion.button>

                <div className="mt-4 flex items-center justify-center text-xs text-zinc-600 gap-1.5">
                  <FontAwesomeIcon icon={faHeart} className="w-3 h-3 text-red-400/60" />
                  Trusted by thousands of servers
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
