"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faShieldHalved, faBolt, faArrowUpRightFromSquare, faGift, faTerminal } from "@fortawesome/free-solid-svg-icons"
import { Cover } from "@/components/ui/cover"
import { GradientText } from "@/components/ui/gradient-text"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
}

function FloatingBadge({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`absolute z-20 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-zinc-950/80 px-3 py-2 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7)] md:px-4 md:py-3 ${className}`}
      style={{ willChange: "transform", backfaceVisibility: "hidden" }}
    >
      {children}
    </div>
  )
}

export function HeroSection() {
  const [isMounted, setIsMounted] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const desktop = window.matchMedia("(min-width: 768px)").matches
    if (!reduced && desktop) {
      const id = window.setTimeout(() => setShowVideo(true), 900)
      return () => clearTimeout(id)
    }
  }, [])

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        {showVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            className="h-full w-full object-cover opacity-[0.06]"
            style={{ mixBlendMode: "screen" }}
          >
            <source src="/sky.mp4" type="video/mp4" />
          </video>
        )}

        <style>{`
          @keyframes orb1 {
            0%, 100% { transform: scale(1); opacity: 0.14; }
            50% { transform: scale(1.12); opacity: 0.22; }
          }
          @keyframes orb2 {
            0%, 100% { transform: scale(1); opacity: 0.1; }
            50% { transform: scale(1.15); opacity: 0.16; }
          }
          @keyframes floatA {
            0%, 100% { transform: translateY(-10px); }
            50% { transform: translateY(10px); }
          }
          @keyframes floatB {
            0%, 100% { transform: translateY(8px); }
            50% { transform: translateY(-8px); }
          }
          @keyframes floatC {
            0%, 100% { transform: translateY(-6px); }
            50% { transform: translateY(8px); }
          }
          @keyframes floatD {
            0%, 100% { transform: translateY(10px); }
            50% { transform: translateY(-10px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .orb-1, .orb-2, .float-a, .float-b, .float-c, .float-d { animation: none !important; }
          }
          .orb-1 { animation: orb1 22s ease-in-out infinite; will-change: transform; }
          .orb-2 { animation: orb2 28s ease-in-out infinite; will-change: transform; }
          .float-a { animation: floatA 6s ease-in-out infinite; will-change: transform; }
          .float-b { animation: floatB 5.5s ease-in-out infinite 0.8s; will-change: transform; }
          .float-c { animation: floatC 6.5s ease-in-out infinite 0.4s; will-change: transform; }
          .float-d { animation: floatD 7s ease-in-out infinite 1s; will-change: transform; }
        `}</style>

        <div
          className="orb-1 pointer-events-none absolute -left-[10%] -top-[20%] h-[60vw] w-[60vw] rounded-full"
          style={{ background: "rgba(139,92,246,0.2)", filter: "blur(80px)" }}
        />
        <div
          className="orb-2 pointer-events-none absolute -bottom-[20%] -right-[10%] h-[50vw] w-[50vw] rounded-full"
          style={{ background: "rgba(124,58,237,0.16)", filter: "blur(90px)" }}
        />

        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse items-center gap-12 lg:grid lg:grid-cols-2 lg:gap-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isMounted ? "visible" : "hidden"}
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <motion.div variants={itemVariants} className="w-full">
              <h1 className="mb-10 flex w-full flex-col gap-0">
                <span className="text-center font-space text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-left lg:text-7xl">
                  Your Discord Server
                </span>

                <span className="py-1 text-center font-playfair text-5xl font-bold italic leading-tight sm:text-6xl md:text-7xl lg:text-left lg:text-8xl">
                  <GradientText text="Needs In A" />
                </span>

                <div className="text-center font-space text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-left lg:text-7xl">
                  <Cover>Single Bot</Cover>
                </div>
              </h1>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-10 flex items-center justify-center gap-4 lg:justify-start">
              <Button
                size="lg"
                className="h-12 cursor-pointer gap-2 rounded-xl border border-white/10 bg-black px-7 text-base font-semibold text-white transition-colors hover:border-white/20 hover:bg-white/[0.05]"
                onClick={() =>
                  window.open(
                    "https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20applications.commands&permissions=1513962695871",
                    "_blank",
                  )
                }
              >
                Invite Demon Bot
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isMounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-8 flex w-full justify-center lg:mb-0"
            style={{ willChange: "transform" }}
          >
            <FloatingBadge className="float-a left-0 top-4 md:-left-8 md:top-10">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/15">
                <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4 text-[#c4b5fd]" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#a78bfa]">Auto-Mod</div>
                <div className="text-sm font-semibold text-white">99.9% Uptime</div>
              </div>
            </FloatingBadge>

            <FloatingBadge className="float-b right-0 top-4 md:-right-4 md:top-6">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-pink-500/30 bg-pink-500/15">
                <FontAwesomeIcon icon={faGift} className="h-4 w-4 text-pink-300" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-pink-400">Giveaways</div>
                <div className="text-sm font-semibold text-white">1-click setup</div>
              </div>
            </FloatingBadge>

            <FloatingBadge className="float-c bottom-8 left-0 md:-left-4 md:bottom-16">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/15">
                <FontAwesomeIcon icon={faTerminal} className="h-4 w-4 text-amber-300" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Commands</div>
                <div className="text-sm font-semibold text-white">100+ available</div>
              </div>
            </FloatingBadge>

            <FloatingBadge className="float-d bottom-10 right-0 md:-right-8 md:bottom-24">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/15">
                <FontAwesomeIcon icon={faBolt} className="h-4 w-4 text-[#c4b5fd]" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#a78bfa]">Latency</div>
                <div className="text-sm font-semibold text-white">&lt;50ms avg</div>
              </div>
            </FloatingBadge>

            <div className="relative z-10">
              <div className="absolute inset-0 rounded-full bg-[#8b5cf6]/20 blur-3xl" />
              <Image
                src="/demon-logo.png"
                alt="Demon Bot"
                width={360}
                height={360}
                priority
                className="relative drop-shadow-[0_20px_60px_rgba(139,92,246,0.35)]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
