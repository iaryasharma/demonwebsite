"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion, useInView } from "framer-motion"
import gsap from "gsap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faShieldHalved, faWandMagicSparkles, faBolt, faRocket, faPlay, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons"

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
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
          ref.current.textContent = Math.floor(obj.val).toLocaleString() + suffix
        }
      },
    })
  }, [inView, target, suffix])

  return <span ref={ref}>0{suffix}</span>
}

const featurePills = [
  { icon: faShieldHalved, label: "Advanced Moderation", color: "border-[#8b5cf6]/30" },
  { icon: faWandMagicSparkles, label: "Anime & Entertainment", color: "border-[#7c3aed]/30" },
  { icon: faBolt, label: "99.9% Uptime", color: "border-[#a78bfa]/30" },
]

const stats = [
  { value: 500, suffix: "+", label: "Servers" },
  { value: 50000, suffix: "+", label: "Users Served" },
  { value: 200, suffix: "+", label: "Commands" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // GSAP headline word-by-word reveal
  useEffect(() => {
    if (!isMounted || !headlineRef.current) return

    const words = headlineRef.current.querySelectorAll(".hero-word")
    gsap.fromTo(
      words,
      { opacity: 0, y: 40, rotateX: -90 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "back.out(1.7)",
        delay: 0.2,
      }
    )
  }, [isMounted])

  // GSAP floating particles
  useEffect(() => {
    if (!isMounted || !particlesRef.current) return

    const particles = particlesRef.current.querySelectorAll(".particle")
    particles.forEach((p) => {
      gsap.to(p, {
        x: `random(-100, 100)`,
        y: `random(-100, 100)`,
        opacity: `random(0.1, 0.6)`,
        scale: `random(0.5, 1.5)`,
        duration: `random(4, 8)`,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    })
  }, [isMounted])

  const [botStats, setBotStats] = useState({
    servers: 1200,
    users: 250000,
    commands: 102
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/bot-stats")
        if (res.ok) {
          const data = await res.json()
          setBotStats({
            servers: data.servers || 1200,
            users: data.users || 250000,
            commands: data.commands || 102
          })
        }
      } catch (error) {
        console.error("Failed to fetch bot stats:", error)
      }
    }
    fetchStats()
  }, [])

  const wrapWords = (text: string) =>
    text.split(" ").map((word, i) => (
      <span
        key={i}
        className="hero-word inline-block"
        style={{ opacity: 0 }}
      >
        {word}&nbsp;
      </span>
    ))

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-15">
          <source src="/sky.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-[#8b5cf6]/10" />

        {/* Floating particles */}
        <div ref={particlesRef} className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle absolute rounded-full"
              style={{
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: i % 3 === 0
                  ? "rgba(139, 92, 246, 0.4)"
                  : i % 3 === 1
                    ? "rgba(124, 58, 237, 0.3)"
                    : "rgba(167, 139, 250, 0.3)",
                opacity: 0.2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isMounted ? "visible" : "hidden"}
            className="text-left"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8b5cf6]/10 to-[#7c3aed]/10 border border-[#8b5cf6]/25 rounded-full text-sm font-medium text-[#a78bfa] backdrop-blur-sm">
                <FontAwesomeIcon icon={faRocket} className="h-3.5 w-3.5" />
                The Ultimate Discord Bot
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={itemVariants}>
              <h1
                ref={headlineRef}
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                style={{ perspective: "1000px" }}
              >
                <span className="block text-white mb-2">
                  {wrapWords("Your Discord Server")}
                </span>
                <span className="block bg-gradient-to-r from-[#8b5cf6] via-[#a78bfa] to-[#7c3aed] bg-clip-text text-transparent mb-2">
                  {wrapWords("Needs in a")}
                </span>
                <span className="block text-white">
                  {wrapWords("Single Bot")}
                </span>
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-gray-400 mb-6 max-w-2xl leading-relaxed"
            >
              Transform your Discord server with the ultimate all-in-one bot. Advanced moderation,
              anime content, utilities, and endless entertainment — all powered by cutting-edge technology.
            </motion.p>

            {/* Feature Pills */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mb-8">
              {featurePills.map((pill, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`flex items-center gap-2 bg-white/[0.03] backdrop-blur-sm px-4 py-2 rounded-full border ${pill.color} transition-colors hover:bg-white/[0.06]`}
                >
                  <FontAwesomeIcon icon={pill.icon} className="h-3.5 w-3.5 text-[#a78bfa]" />
                  <span className="text-sm text-gray-300">{pill.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-10">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-semibold px-8 py-4 text-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#8b5cf6]/30 border-0"
                  onClick={() =>
                    window.open(
                      "https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20identify%20guilds%20applications.commands&response_type=code&permissions=1513962695871&state=QGn-6VzBYf2Ta8nMk_tFe",
                      "_blank"
                    )
                  }
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="mr-2 h-4 w-4" />
                  Invite Bot
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-6"
            >
              {[
                { value: botStats.servers, suffix: "+", label: "Servers" },
                { value: botStats.users, suffix: "+", label: "Users Served" },
                { value: botStats.commands, suffix: "+", label: "Commands" },
              ].map((stat, i) => (
                <div key={i} className="text-center sm:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={isMounted ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <motion.div
              className="relative cursor-pointer"
              whileHover={{ scale: 1.08, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6]/30 to-[#7c3aed]/30 rounded-full blur-3xl animate-glow-pulse" />
              <Image
                src="/demon-logo.png"
                alt="Demon Bot"
                width={350}
                height={350}
                className="relative drop-shadow-2xl"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  )
}
