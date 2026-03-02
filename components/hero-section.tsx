"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faShieldHalved, faBolt, faArrowUpRightFromSquare, faGift, faTerminal } from "@fortawesome/free-solid-svg-icons"
import { Cover } from "@/components/ui/cover"
import { CanvasText } from "@/components/ui/canvas-text"

// Lazy-load BackgroundBeams only after hydration so it never blocks paint
import dynamic from "next/dynamic"
const BackgroundBeams = dynamic(
  () => import("@/components/ui/background-beams").then((m) => ({ default: m.BackgroundBeams })),
  { ssr: false }
)

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
}

/** Floating badge — y-only animation = GPU composited, no layout/paint */
function FloatingBadge({
  children,
  className,
  animStyle,
}: {
  children: React.ReactNode
  className?: string
  animStyle: React.CSSProperties
}) {
  return (
    <div
      className={`absolute z-20 flex items-center gap-3 px-3 py-2 md:px-4 md:py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7)] ${className}`}
      style={{
        willChange: "transform",
        backfaceVisibility: "hidden",
        ...animStyle,
      }}
    >
      {children}
    </div>
  )
}

export function HeroSection() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* ── Backgrounds ── */}
      <div className="absolute inset-0 z-0 bg-black overflow-hidden">
        {/* Video — very low opacity, plays independently */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-[0.05]"
          style={{ mixBlendMode: "screen" }}
        >
          <source src="/sky.mp4" type="video/mp4" />
        </video>

        {/* Aurora orbs — pure CSS so they never hit the JS thread.
            No mix-blend-screen (forces repaint); opacity blending via alpha only.
            will-change: transform so the browser promotes to its own layer */}
        <style>{`
          @keyframes orb1 {
            0%, 100% { transform: scale(1);   opacity: 0.12; }
            50%       { transform: scale(1.18); opacity: 0.22; }
          }
          @keyframes orb2 {
            0%, 100% { transform: scale(1);   opacity: 0.08; }
            50%       { transform: scale(1.22); opacity: 0.16; }
          }
          @keyframes floatA {
            0%, 100% { transform: translateY(-12px); }
            50%       { transform: translateY(12px);  }
          }
          @keyframes floatB {
            0%, 100% { transform: translateY(10px);  }
            50%       { transform: translateY(-10px); }
          }
          @keyframes floatC {
            0%, 100% { transform: translateY(-8px);  }
            50%       { transform: translateY(10px);  }
          }
          @keyframes floatD {
            0%, 100% { transform: translateY(12px);  }
            50%       { transform: translateY(-12px); }
          }
          .orb-1 { animation: orb1 20s ease-in-out infinite; will-change: transform; }
          .orb-2 { animation: orb2 25s ease-in-out infinite; will-change: transform; }
          .float-a { animation: floatA 6s ease-in-out infinite; will-change: transform; }
          .float-b { animation: floatB 5.5s ease-in-out infinite 0.8s; will-change: transform; }
          .float-c { animation: floatC 6.5s ease-in-out infinite 0.4s; will-change: transform; }
          .float-d { animation: floatD 7s ease-in-out infinite 1s; will-change: transform; }
        `}</style>

        <div
          className="orb-1 absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full pointer-events-none"
          style={{ background: "rgba(139,92,246,0.18)", filter: "blur(100px)" }}
        />
        <div
          className="orb-2 absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full pointer-events-none"
          style={{ background: "rgba(124,58,237,0.14)", filter: "blur(110px)" }}
        />

        {/* Gradient overlays — static, zero cost */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      {/* BackgroundBeams deferred — only mounts after JS hydration */}
      {isMounted && (
        <div className="absolute inset-0 z-[1] pointer-events-none opacity-25">
          <BackgroundBeams />
        </div>
      )}

      {/* ── Content ── */}
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left — Headline + CTA */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isMounted ? "visible" : "hidden"}
            className="text-center lg:text-left flex flex-col items-center lg:items-start"
          >
            <motion.div variants={itemVariants} className="w-full">
              <h1 className="flex flex-col gap-0 mb-10 w-full">
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-space tracking-tight text-white leading-tight text-center lg:text-left">
                  Your Discord Server
                </span>

                <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-playfair italic font-bold leading-tight text-center lg:text-left py-1">
                  <CanvasText
                    text="Needs In A"
                    backgroundClassName="bg-black"
                    colors={[
                      "rgba(139, 92, 246, 1)",
                      "rgba(167, 139, 250, 0.9)",
                      "rgba(139, 92, 246, 0.85)",
                      "rgba(196, 181, 253, 0.7)",
                      "rgba(109, 40, 217, 0.85)",
                      "rgba(139, 92, 246, 0.6)",
                      "rgba(167, 139, 250, 0.5)",
                      "rgba(139, 92, 246, 0.4)",
                      "rgba(109, 40, 217, 0.3)",
                      "rgba(139, 92, 246, 0.2)",
                    ]}
                    lineGap={4}
                    animationDuration={20}
                    curveIntensity={50}
                    lineWidth={1.2}
                  />
                </span>

                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-space font-bold tracking-tight text-white leading-tight text-center lg:text-left">
                  <Cover>Single Bot</Cover>
                </div>
              </h1>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start gap-4 mb-10">
              <Button
                size="lg"
                className="h-12 bg-black border border-white/10 text-white font-semibold px-7 text-base transition-colors hover:bg-white/[0.05] hover:border-white/20 rounded-xl gap-2 cursor-pointer"
                onClick={() =>
                  window.open(
                    "https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20applications.commands&permissions=1513962695871",
                    "_blank"
                  )
                }
              >
                Invite Demon Bot
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Right — Logo + floating badges */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isMounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center relative w-full mb-8 lg:mb-0"
            style={{ willChange: "transform" }}
          >
            {/* Badge 1 — Top Left: Auto-Mod */}
            <FloatingBadge className="float-a left-0 md:-left-8 top-4 md:top-10" animStyle={{}}>
              <div className="w-9 h-9 rounded-full bg-[#8b5cf6]/15 flex items-center justify-center border border-[#8b5cf6]/30 flex-shrink-0">
                <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4 text-[#c4b5fd]" />
              </div>
              <div>
                <div className="text-[11px] text-[#a78bfa] font-bold tracking-wider uppercase">Auto-Mod</div>
                <div className="text-sm font-semibold text-white">99.9% Uptime</div>
              </div>
            </FloatingBadge>

            {/* Badge 2 — Top Right: Giveaways */}
            <FloatingBadge className="float-b right-0 md:-right-4 top-4 md:top-6" animStyle={{}}>
              <div className="w-9 h-9 rounded-full bg-pink-500/15 flex items-center justify-center border border-pink-500/30 flex-shrink-0">
                <FontAwesomeIcon icon={faGift} className="h-4 w-4 text-pink-300" />
              </div>
              <div>
                <div className="text-[11px] text-pink-400 font-bold tracking-wider uppercase">Giveaways</div>
                <div className="text-sm font-semibold text-white">1-click setup</div>
              </div>
            </FloatingBadge>

            {/* Badge 3 — Bottom Left: Commands */}
            <FloatingBadge className="float-c left-0 md:-left-4 bottom-8 md:bottom-16" animStyle={{}}>
              <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center border border-amber-500/30 flex-shrink-0">
                <FontAwesomeIcon icon={faTerminal} className="h-4 w-4 text-amber-300" />
              </div>
              <div>
                <div className="text-[11px] text-amber-400 font-bold tracking-wider uppercase">Commands</div>
                <div className="text-sm font-semibold text-white">100+ available</div>
              </div>
            </FloatingBadge>

            {/* Badge 4 — Bottom Right: Latency */}
            <FloatingBadge className="float-d right-0 md:-right-8 bottom-10 md:bottom-24" animStyle={{}}>
              <div className="w-9 h-9 rounded-full bg-[#7c3aed]/15 flex items-center justify-center border border-[#7c3aed]/30 flex-shrink-0">
                <FontAwesomeIcon icon={faBolt} className="h-4 w-4 text-[#c4b5fd]" />
              </div>
              <div>
                <div className="text-[11px] text-[#a78bfa] font-bold tracking-wider uppercase">Latency</div>
                <div className="text-sm font-semibold text-white">Super Fast</div>
              </div>
            </FloatingBadge>

            {/* Logo */}
            <div className="relative cursor-pointer z-10">
              {/* Static glow — no animation needed, just CSS radial */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)", filter: "blur(30px)" }}
              />
              <Image
                src="/demon-logo.png"
                alt="Demon Bot - Multipurpose Discord Bot Logo"
                width={400}
                height={400}
                className="relative z-10 w-full max-w-[280px] md:max-w-[380px] h-auto aspect-square"
                style={{ filter: "drop-shadow(0 0 30px rgba(139,92,246,0.25))" }}
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  )
}
