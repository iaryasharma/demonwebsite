"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCrown, faBars, faXmark, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/commands", label: "Commands" },
  { href: "/team", label: "Team" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/premium", label: "Premium", icon: faCrown },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50)
        ticking = false
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? "border-b border-white/[0.06] bg-black/85 shadow-xl shadow-black/30 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative">
              <Image
                src="/demon-logo.png"
                alt="Demon Bot"
                width={30}
                height={30}
                className="relative z-10 transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white">
              Demon<span className="text-[#8b5cf6]"> Bot</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 md:flex">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-sm font-medium text-zinc-400 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white"
              >
                {item.icon && (
                  <FontAwesomeIcon icon={item.icon} className="h-3 w-3 text-yellow-400" />
                )}
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <Button
              className="h-9 cursor-pointer gap-2 rounded-xl border-0 bg-[#8b5cf6] px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#7c3aed] hover:shadow-lg hover:shadow-[#8b5cf6]/25"
              onClick={() =>
                window.open(
                  "https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20applications.commands&permissions=1513962695871",
                  "_blank",
                )
              }
            >
              Invite Bot
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3 opacity-75" />
            </Button>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsOpen(v => !v)}
              className="h-9 w-9 text-white hover:bg-white/[0.06]"
            >
              <FontAwesomeIcon icon={isOpen ? faXmark : faBars} className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`overflow-hidden border-b border-white/[0.06] bg-black/90 backdrop-blur-md transition-[max-height,opacity] duration-200 md:hidden ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 border-transparent opacity-0"
        }`}
      >
        <div className="space-y-1 px-4 pb-5 pt-3">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              {item.icon && (
                <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5 text-yellow-400" />
              )}
              {item.label}
            </Link>
          ))}
          <Button
            className="mt-2 h-10 w-full cursor-pointer rounded-xl border-0 bg-[#8b5cf6] font-semibold text-white hover:bg-[#7c3aed]"
            onClick={() =>
              window.open(
                "https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20applications.commands&permissions=1513962695871",
                "_blank",
              )
            }
          >
            Invite Bot
          </Button>
        </div>
      </div>
    </nav>
  )
}
