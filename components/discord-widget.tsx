"use client"

import { useState, useEffect } from "react"
import { Users, MessageCircle, Heart, ExternalLink } from "lucide-react"

export function DiscordWidget() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-black via-gray-900/50 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#5865F2]/30 rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-[#8b5cf6]/40 rounded-full animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-500" />
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#5865F2]/10 to-[#8b5cf6]/10 border border-[#5865F2]/20 rounded-full text-sm font-medium text-[#5865F2] backdrop-blur-sm">
              💬 Community Hub
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Join Our Growing Community
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Connect with other server owners, get instant support, share feedback, and stay updated with the latest features and announcements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Community Stats */}
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-[#5865F2]/20 hover:border-[#5865F2]/40 transition-all duration-300">
                <Users className="w-8 h-8 text-[#5865F2] mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">5,000+</div>
                <div className="text-gray-400 text-sm">Active Members</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/40 transition-all duration-300">
                <MessageCircle className="w-8 h-8 text-[#8b5cf6] mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">24/7</div>
                <div className="text-gray-400 text-sm">Support</div>
              </div>
            </div>
            
            <div className="text-left space-y-4">
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-[#8b5cf6] rounded-full mr-3"></div>
                <span>Get help with bot setup and configuration</span>
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-[#5865F2] rounded-full mr-3"></div>
                <span>Share feedback and feature requests</span>
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-[#8b5cf6] rounded-full mr-3"></div>
                <span>Connect with other server owners</span>
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-[#5865F2] rounded-full mr-3"></div>
                <span>Stay updated with announcements</span>
              </div>
            </div>
          </div>

          {/* Discord Server Widget */}
          <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5865F2]/20 to-[#8b5cf6]/20 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-[#5865F2]/30 hover:border-[#5865F2]/50 transition-all duration-300 group">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#5865F2] to-[#4752C4] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Demon Bot Official</h3>
                  <div className="flex items-center justify-center text-gray-400 text-sm mb-4">
                    <div className="w-2 h-2 bg-violet-400 rounded-full mr-2 animate-pulse"></div>
                    <span>1,234 members online</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Official support server for Demon Bot. Get help, share feedback, and connect with our community!
                  </p>
                </div>

                <button 
                  onClick={() => window.open('https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20identify%20guilds%20applications.commands&response_type=code&permissions=1513962695871&state=QGn-6VzBYf2Ta8nMk_tFe', '_blank')}
                  className="w-full bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#4752C4] hover:to-[#3C45A5] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#5865F2]/25 hover:-translate-y-1 flex items-center justify-center"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Join Community Server
                </button>
                
                <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
                  <Heart className="w-3 h-3 mr-1 text-red-400" />
                  <span>Trusted by many servers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
