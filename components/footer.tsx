import Link from "next/link"
import Image from "next/image"
import { Github, Twitter, ExternalLink, Shield, Heart, Command } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-black via-gray-900/50 to-black border-t border-[#00FF85]/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#00FF85]/20 rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-[#00D4AA]/30 rounded-full animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-white/10 rounded-full animate-pulse delay-500" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="relative w-10 h-10 mr-3">
                <Image
                  src="/demon-logo.png"
                  alt="Demon Bot Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              </div>
              <h3 className="text-xl font-bold text-white">Demon Bot</h3>
            </div>
            <p className="text-gray-400 mb-4 max-w-md leading-relaxed">
              The ultimate Discord bot for modern communities. Enhance your server with advanced moderation, 
              entertainment, and management tools.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20identify%20guilds%20applications.commands&response_type=code&permissions=1513962695871&state=QGn-6VzBYf2Ta8nMk_tFe" 
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#00FF85] to-[#00D4AA] text-black font-medium rounded-lg hover:from-[#00E077] hover:to-[#00C19B] transition-all duration-200 hover:shadow-lg hover:shadow-[#00FF85]/25"
                title="Invite Demon Bot"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Invite Bot
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/commands" className="text-gray-400 hover:text-[#00FF85] transition-colors flex items-center">
                  <Command className="w-4 h-4 mr-2" />
                  Commands
                </Link>
              </li>
              <li>
                <Link href="/premium" className="text-gray-400 hover:text-[#00FF85] transition-colors flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Premium
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-gray-400 hover:text-[#00FF85] transition-colors flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-[#00FF85] transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <div className="space-y-3">
              <Link 
                href="https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20identify%20guilds%20applications.commands&response_type=code&permissions=1513962695871&state=QGn-6VzBYf2Ta8nMk_tFe" 
                className="flex items-center text-gray-400 hover:text-[#5865F2] transition-colors"
                title="Join our Discord Server"
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Discord Community
              </Link>
              <Link 
                href="https://github.com/iaryasharma" 
                className="flex items-center text-gray-400 hover:text-[#00FF85] transition-colors"
                title="View Source Code"
              >
                <Github className="w-5 h-5 mr-3" />
                GitHub
              </Link>
              <Link 
                href="https://x.com/iaryasharma" 
                className="flex items-center text-gray-400 hover:text-[#00FF85] transition-colors"
                title="Follow on X"
              >
                <Twitter className="w-5 h-5 mr-3" />
                Twitter / X
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#00FF85]/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400">
                Made with 💖 by{" "}
                <Link
                  href="https://fragnite.vercel.app"
                  className="text-[#00FF85] hover:text-[#00D4AA] transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FragNite
                </Link>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Enhancing Discord communities worldwide
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
              <p className="text-sm text-gray-500 mb-2">
                © 2025 Demon Bot. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span>Privacy Policy</span>
                <span>•</span>
                <span>Terms of Service</span>
                <span>•</span>
                <span>Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}