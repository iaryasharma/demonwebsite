"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCrown, faBars, faXmark } from "@fortawesome/free-solid-svg-icons"

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
    { href: "/privacy", label: "Privacy" },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled
        ? "backdrop-blur-xl bg-black/60 border-b border-white/10 shadow-lg shadow-black/20"
        : "backdrop-blur-none bg-transparent border-b border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Image
                src="/demon-logo.png"
                alt="Demon Bot"
                width={32}
                height={32}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#8b5cf6]/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Demon Bot
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * i, ease: "easeOut" }}
                >
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5 flex items-center relative group"
                  >
                    {item.icon && (
                      <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5 mr-1.5 text-yellow-400" />
                    )}
                    {item.label}
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Button
              className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-medium px-6 py-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#8b5cf6]/30 hover:-translate-y-0.5 border-0"
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="hover:bg-white/10 text-white"
            >
              <FontAwesomeIcon icon={isOpen ? faXmark : faBars} className="h-5 w-5" />
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
            className="md:hidden backdrop-blur-xl bg-black/80 border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * i }}
                >
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-white hover:bg-white/5 flex items-center px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && (
                      <FontAwesomeIcon icon={item.icon} className="h-4 w-4 mr-2 text-yellow-400" />
                    )}
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
              >
                <Button
                  className="w-full mt-3 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-medium border-0"
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
