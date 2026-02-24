import Link from "next/link"
import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDiscord, faGithub, faXTwitter } from "@fortawesome/free-brands-svg-icons"
import { faArrowUpRightFromSquare, faTerminal, faShieldHalved, faHeart, faCode } from "@fortawesome/free-solid-svg-icons"

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-black via-gray-950 to-black border-t border-white/[0.06]">
      {/* Shimmer border top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/40 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
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
            <p className="text-gray-500 mb-6 max-w-md leading-relaxed text-sm">
              The ultimate Discord bot for modern communities. Enhance your server with advanced moderation,
              entertainment, and management tools.
            </p>
            <Link
              href="https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20identify%20guilds%20applications.commands&response_type=code&permissions=1513962695871&state=QGn-6VzBYf2Ta8nMk_tFe"
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#8b5cf6]/20 transition-all duration-300 hover:-translate-y-0.5 text-sm"
              title="Invite Demon Bot"
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-3.5 h-3.5 mr-2" />
              Invite Bot
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/commands" className="text-gray-500 hover:text-[#a78bfa] transition-colors flex items-center text-sm group">
                  <FontAwesomeIcon icon={faTerminal} className="w-3.5 h-3.5 mr-2.5 group-hover:translate-x-0.5 transition-transform" />
                  Commands
                </Link>
              </li>
              <li>
                <Link href="/premium" className="text-gray-500 hover:text-[#a78bfa] transition-colors flex items-center text-sm group">
                  <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5 mr-2.5 group-hover:translate-x-0.5 transition-transform" />
                  Premium
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-gray-500 hover:text-[#a78bfa] transition-colors flex items-center text-sm group">
                  <FontAwesomeIcon icon={faHeart} className="w-3.5 h-3.5 mr-2.5 group-hover:translate-x-0.5 transition-transform" />
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-500 hover:text-[#a78bfa] transition-colors flex items-center text-sm group">
                  <FontAwesomeIcon icon={faCode} className="w-3.5 h-3.5 mr-2.5 group-hover:translate-x-0.5 transition-transform" />
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Connect</h4>
            <div className="space-y-3">
              <Link
                href="https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20identify%20guilds%20applications.commands&response_type=code&permissions=1513962695871&state=QGn-6VzBYf2Ta8nMk_tFe"
                className="flex items-center text-gray-500 hover:text-[#5865F2] transition-colors text-sm group"
                title="Join our Discord Server"
              >
                <FontAwesomeIcon icon={faDiscord} className="w-4 h-4 mr-2.5 group-hover:scale-110 transition-transform" />
                Discord Community
              </Link>
              <Link
                href="https://github.com/iaryasharma"
                className="flex items-center text-gray-500 hover:text-[#a78bfa] transition-colors text-sm group"
                title="View Source Code"
              >
                <FontAwesomeIcon icon={faGithub} className="w-4 h-4 mr-2.5 group-hover:scale-110 transition-transform" />
                GitHub
              </Link>
              <Link
                href="https://x.com/iaryasharma"
                className="flex items-center text-gray-500 hover:text-[#a78bfa] transition-colors text-sm group"
                title="Follow on X"
              >
                <FontAwesomeIcon icon={faXTwitter} className="w-4 h-4 mr-2.5 group-hover:scale-110 transition-transform" />
                Twitter / X
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/[0.05] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-500 text-sm">
                Made with{" "}
                <FontAwesomeIcon icon={faHeart} className="w-3 h-3 text-red-400/60 mx-0.5 inline" />{" "}
                by{" "}
                <Link
                  href="https://fragnite.vercel.app"
                  className="text-[#a78bfa] hover:text-[#8b5cf6] transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FragNite
                </Link>
              </p>
              <p className="text-xs text-gray-700 mt-1">
                Enhancing Discord communities worldwide
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end">
              <p className="text-xs text-gray-600 mb-2">
                © 2025 Demon Bot. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-700">
                <Link href="/privacy" className="hover:text-gray-500 transition-colors">Privacy Policy</Link>
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
