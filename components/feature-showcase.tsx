"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Image from "next/image"

export function FeatureShowcase() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Badges Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32">
          <div className="order-2 lg:order-1">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#00FF85]/30 transition-all duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <Image src="/demon-logo.png" alt="Demon Bot" width={48} height={48} className="rounded-full" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-gray-400 text-sm">@ARYA !!badge @Mr. Frag Nite</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Image src="/demon-logo.png" alt="Demon Bot" width={24} height={24} className="rounded-full mr-2" />
                    <span className="text-white font-semibold">DEMON</span>
                    <Badge className="ml-2 bg-gray-700 text-gray-300 text-xs">BOT</Badge>
                    <span className="text-gray-400 text-xs ml-2">Today at 11:47 AM</span>
                  </div>
                  <div className="mt-4 bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-white/5">
                    <div className="flex items-center mb-3">
                      <Image
                        src="/demon-logo.png"
                        alt="Demon Bot"
                        width={24}
                        height={24}
                        className="rounded-full mr-2"
                      />
                      <span className="text-white font-medium">Mr. Frag Nite's Badges</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-[#00FF85] font-semibold">&gt; OWNER</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-blue-400 font-semibold">DEVELOPER</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-purple-400 font-semibold">DEVELOPER TEAM</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-pink-400 font-semibold">ONE AND ONLY ONE</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-400 font-semibold">MOST SPECIAL</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#00FF85]/10 to-[#00D4AA]/10 border border-[#00FF85]/20 rounded-full text-sm font-medium text-[#00FF85] backdrop-blur-sm">
                🏆 Recognition System
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Show off your Badges!
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Earn exclusive badges by contributing to the community and helping us improve the bot. Display your achievements and stand out among your peers.
            </p>
            <Button className="bg-gradient-to-r from-[#00FF85] to-[#00D4AA] text-black hover:from-[#00E077] hover:to-[#00C19B] font-medium px-6 py-3 transition-all duration-200 hover:shadow-lg hover:shadow-[#00FF85]/25 hover:-translate-y-1">
              Learn More
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Anime Search Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32">
          <div>
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-full text-sm font-medium text-pink-400 backdrop-blur-sm">
                🎌 Anime Database
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Track Airing Anime!
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Get comprehensive anime information including episode counts, ratings, scores, and air dates. Perfect for anime enthusiasts in your server.
            </p>
            <Button className="bg-gradient-to-r from-[#00FF85] to-[#00D4AA] text-black hover:from-[#00E077] hover:to-[#00C19B] font-medium px-6 py-3 transition-all duration-200 hover:shadow-lg hover:shadow-[#00FF85]/25 hover:-translate-y-1">
              Learn More
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div>
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-pink-500/30 transition-all duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <Image src="/demon-logo.png" alt="Demon Bot" width={48} height={48} className="rounded-full" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-white font-semibold">DEMON</span>
                    <Badge className="ml-2 bg-gray-700 text-gray-300 text-xs">BOT</Badge>
                    <span className="text-gray-400 text-xs ml-2">05/26/2022</span>
                  </div>
                  <div className="mt-4 bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-white/5">
                    <div className="text-[#00FF85] font-semibold mb-4">
                      My Anime List search result for Attack On Titan
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-400 text-sm block">English Title</span>
                          <div className="text-white font-medium">Attack on Titan</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm block">Japanese Title</span>
                          <div className="text-white font-medium">進撃の巨人</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm block">Type</span>
                          <div className="text-white font-medium">TV</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm block">Episodes</span>
                          <div className="text-white font-medium">25</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-400 text-sm block">Rating</span>
                          <div className="text-white font-medium">R-17+ (violence & profanity)</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm block">Aired</span>
                          <div className="text-white font-medium">Apr 7, 2013 to Sep 29, 2013</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm block">Score</span>
                          <div className="text-white font-medium">8.53</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm block">Score Stats</span>
                          <div className="text-white font-medium">scored by 2,441,808 users</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <span className="text-gray-400 text-sm block mb-1">Link</span>
                      <div className="text-[#00FF85] text-sm break-all">
                        https://myanimelist.net/anime/16498/Shingeki_no_Kyojin
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Command Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <Image src="/demon-logo.png" alt="Demon Bot" width={48} height={48} className="rounded-full" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-white font-semibold">DEMON</span>
                    <Badge className="ml-2 bg-gray-700 text-gray-300 text-xs">BOT</Badge>
                    <span className="text-gray-400 text-xs ml-2">Today at 12:20 PM</span>
                  </div>
                  <div className="mt-4 bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-white/5">
                    <div className="text-white font-semibold mb-3">DEMON Help Menu</div>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#00FF85] rounded-full mr-3"></span>
                        My prefix is !!
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#00FF85] rounded-full mr-3"></span>
                        <span className="text-[#00FF85] hover:underline cursor-pointer">Get Demon</span> | <span className="text-[#00FF85] hover:underline cursor-pointer">Support server</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-[#00FF85] rounded-full mr-3 mt-1.5"></span>
                        Type: <span className="text-gray-400 font-mono bg-gray-700/50 px-2 py-1 rounded text-sm ml-1">!!help &lt;command | module&gt;</span> for more info.
                      </li>
                    </ul>
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <div className="text-white font-semibold mb-2">MAIN COMMANDS</div>
                      <div className="w-full h-1 bg-gradient-to-r from-[#00FF85] to-[#00D4AA] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-full text-sm font-medium text-blue-400 backdrop-blur-sm">
                ⚡ Command Center
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Multiple Command Categories
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Explore our extensive collection of commands organized into intuitive categories for seamless server management and entertainment.
            </p>
            <Button className="bg-gradient-to-r from-[#00FF85] to-[#00D4AA] text-black hover:from-[#00E077] hover:to-[#00C19B] font-medium px-6 py-3 transition-all duration-200 hover:shadow-lg hover:shadow-[#00FF85]/25 hover:-translate-y-1">
              View All Commands
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}