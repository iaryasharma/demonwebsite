"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import Lenis from "lenis"

const MARKETING_PREFIXES = ["/", "/commands", "/premium", "/team", "/privacy"]

function isMarketingPath(pathname: string | null) {
  if (!pathname) return false
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api") || pathname.startsWith("/transcript")) {
    return false
  }
  return MARKETING_PREFIXES.some(p => pathname === p || (p !== "/" && pathname.startsWith(p)))
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const lenisRef = useRef<Lenis | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduced || !isMarketingPath(pathname)) {
      lenisRef.current?.destroy()
      lenisRef.current = null
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.6,
    })
    lenisRef.current = lenis

    const raf = (time: number) => {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }
    rafRef.current = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafRef.current)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [pathname])

  return <>{children}</>
}
