"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ExternalLink, Play } from "lucide-react"

export function HeroSection() {
  const [logoHover, setLogoHover] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20">
          <source src="/sky.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#8b5cf6]/30 rounded-full animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-[#7c3aed]/40 rounded-full animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-500" />
        </div>
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={`text-left transition-all duration-1000 ${isMounted && isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#8b5cf6]/10 to-[#7c3aed]/10 border border-[#8b5cf6]/20 rounded-full text-sm font-medium text-[#8b5cf6] backdrop-blur-sm">
                🚀 The Ultimate Discord Bot
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block text-white mb-2">Your Discord Server</span>
              <span className="block bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] bg-clip-text text-transparent mb-2">
                Needs in a
              </span>
              <span className="block text-white">Single Bot</span>
            </h1>

            {/* Enhanced Tagline */}
            <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-2xl leading-relaxed">
              Transform your Discord server with the ultimate all-in-one bot. Advanced moderation, 
              anime content, utilities, and endless entertainment - all powered by cutting-edge technology.
            </p>

            {/* Key Features List */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full border border-[#8b5cf6]/20">
                <div className="w-2 h-2 bg-[#8b5cf6] rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Advanced Moderation</span>
              </div>
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full border border-[#7c3aed]/20">
                <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-pulse delay-200"></div>
                <span className="text-sm text-gray-300">Anime & Entertainment</span>
              </div>
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full border border-[#8b5cf6]/20">
                <div className="w-2 h-2 bg-[#8b5cf6] rounded-full animate-pulse delay-500"></div>
                <span className="text-sm text-gray-300">99.9% Uptime</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-black hover:from-[#8b5cf6] hover:to-[#7c3aed] font-semibold px-8 py-4 text-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#8b5cf6]/25 hover:-translate-y-1"
                onClick={() => window.open('https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20identify%20guilds%20applications.commands&response_type=code&permissions=1513962695871&state=QGn-6VzBYf2Ta8nMk_tFe', '_blank')}
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Invite Bot
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 px-8 py-4 text-lg transition-all duration-200 hover:border-[#8b5cf6]/50"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Logo */}
          <div className={`flex justify-center lg:justify-end transition-all duration-1000 delay-300 ${isMounted && isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div 
              className="relative cursor-pointer group"
              onMouseEnter={() => setLogoHover(true)}
              onMouseLeave={() => setLogoHover(false)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6]/20 to-[#7c3aed]/20 rounded-full blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 scale-150" />
              <Image
                src="/demon-logo.png"
                alt="Demon Bot"
                width={350}
                height={350}
                className={`relative transition-all duration-500 ${logoHover ? 'scale-110 rotate-6' : 'scale-100'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>

      {/* Wave SVG */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path
            fill="url(#gradient)"
            fillOpacity="0.1"
            d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  )
}
