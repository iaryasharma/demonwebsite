"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCrown, faBars, faXmark, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50)
  })

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/commands", label: "Commands" },
    { href: "/team", label: "Team" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/premium", label: "Premium", icon: faCrown },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled
        ? "backdrop-blur-xl bg-black/70 border-b border-white/[0.06] shadow-xl shadow-black/30"
        : "backdrop-blur-none bg-transparent border-b border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <Image
                src="/demon-logo.png"
                alt="Demon Bot"
                width={30}
                height={30}
                className="transition-transform duration-300 group-hover:scale-110 relative z-10"
              />
              <div className="absolute inset-0 bg-[#8b5cf6]/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-[15px] font-bold text-white tracking-tight">
              Demon<span className="text-[#8b5cf6]"> Bot</span>
            </span>
          </Link>

          {/* Desktop nav — centered pill */}
          <div className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
            {navItems.map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 * i }}
              >
                <Link
                  href={item.href}
                  className="relative text-zinc-400 hover:text-white px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/[0.06] flex items-center gap-1.5 group"
                >
                  {item.icon && (
                    <FontAwesomeIcon icon={item.icon} className="h-3 w-3 text-yellow-400" />
                  )}
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Button
              className="h-9 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-semibold px-5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#8b5cf6]/25 hover:-translate-y-0.5 border-0 gap-2 cursor-pointer"
              onClick={() =>
                window.open(
                  "https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20applications.commands&permissions=1513962695871",
                  "_blank"
                )
              }
            >
              Invite Bot
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3 opacity-75" />
            </Button>
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="hover:bg-white/[0.06] text-white w-9 h-9"
            >
              <FontAwesomeIcon icon={isOpen ? faXmark : faBars} className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden backdrop-blur-xl bg-black/80 border-b border-white/[0.06] overflow-hidden"
          >
            <div className="px-4 pt-3 pb-5 space-y-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: 0.04 * i }}
                >
                  <Link
                    href={item.href}
                    className="text-zinc-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && (
                      <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5 text-yellow-400" />
                    )}
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.28 }}
              >
                <Button
                  className="w-full mt-2 h-10 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold border-0 rounded-xl cursor-pointer"
                  onClick={() =>
                    window.open(
                      "https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20applications.commands&permissions=1513962695871",
                      "_blank"
                    )
                  }
                >
                  Invite Bot
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
