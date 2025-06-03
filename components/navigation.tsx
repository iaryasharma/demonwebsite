"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, Star } from "lucide-react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/commands", label: "Commands" },
    { href: "/team", label: "Team" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/premium", label: "Premium", icon: Star },
    { href: "/privacy", label: "Privacy" },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
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
              <div className="absolute inset-0 bg-[#00FF85]/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Demon Bot
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5 flex items-center relative group"
                >
                  {item.icon && <item.icon className="h-4 w-4 mr-1.5" />}
                  {item.label}
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-[#00FF85] to-[#00D4AA] transition-all duration-300 group-hover:w-full group-hover:left-0" />
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <Button 
              className="bg-gradient-to-r from-[#00FF85] to-[#00D4AA] text-black hover:from-[#00E077] hover:to-[#00C19B] font-medium px-6 py-2 transition-all duration-200 hover:shadow-lg hover:shadow-[#00FF85]/25 hover:-translate-y-0.5"
              onClick={() => window.open('https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20identify%20guilds%20applications.commands&response_type=code&permissions=1513962695871&state=QGn-6VzBYf2Ta8nMk_tFe', '_blank')}
            >
              Invite Bot
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(!isOpen)}
              className="hover:bg-white/10"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden backdrop-blur-md bg-black/40 border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-white hover:bg-white/5 flex items-center px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                {item.label}
              </Link>
            ))}
            <Button 
              className="w-full mt-4 bg-gradient-to-r from-[#00FF85] to-[#00D4AA] text-black hover:from-[#00E077] hover:to-[#00C19B] font-medium"
              onClick={() => window.open('https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20identify%20guilds%20applications.commands&response_type=code&permissions=1513962695871&state=QGn-6VzBYf2Ta8nMk_tFe', '_blank')}
            >
              Invite Bot
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}