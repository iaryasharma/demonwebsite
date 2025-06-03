"use client";

import { ExternalLink } from "lucide-react";
import { useEffect } from "react";

export default function TeamPage() {
  // Prevent image downloads on the entire page
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };
    
    const handleDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };

    const handleSelectStart = (e: Event) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);
  return (
    <div className="min-h-screen bg-black relative">
      {/* Fixed Video Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          style={{
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <source src="/sky.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      <div className="relative z-10 pt-24 px-4 pb-8">
      {/* Team Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#00FF85] to-[#00D4AA] bg-clip-text text-transparent mb-4">
          Demon Development Team
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Meet the passionate developers behind Demon Bot, dedicated to creating the best Discord experience for our community.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-b from-[#1e1e23] to-[#16161a] border border-[#2a2a2f] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Banner */}
          <div className="h-32 relative overflow-hidden">
            <img 
              src="/Fragnite-banner.gif" 
              alt="FragNite Banner"
              className="w-full h-full object-cover select-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              style={{ pointerEvents: 'none' }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#16161a] via-[#16161a]/80 to-transparent" />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="relative w-24 h-24 -mt-12 mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-[#16161a] overflow-hidden shadow-xl">
                <img 
                  src="/Fragnite.jpg" 
                  alt="FragNite Avatar"
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  style={{ pointerEvents: 'none' }}
                />
              </div>
              {/* Online status indicator with glow */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-[#16161a] bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
            </div>

            {/* User Info */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                FragNite
              </h2>
              <p className="text-gray-400 text-base mb-2 font-medium">fragnite.</p>
              <p className="text-gray-500 text-sm font-mono">ID: 730424922639302693</p>
            </div>

            {/* Elegant Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent blur-sm" />
            </div>

            {/* About Me */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                About Me
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Full-stack developer passionate about creating innovative Discord bots and web applications. Computer Science student with expertise in AI/ML and modern web technologies.
              </p>
            </div>

            {/* Role */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                Role
              </h3>
              <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-400/20 to-emerald-400/20 border border-green-400/30 rounded-full text-green-400 text-sm font-medium shadow-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                Developer
              </div>
            </div>

            {/* Portfolio */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                Portfolio
              </h3>
              <a 
                href="https://fragnite.vercel.app" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-gradient-to-r from-[#1f1f24] to-[#25252a] hover:from-[#2a2a30] hover:to-[#30303a] border border-gray-700/50 hover:border-blue-400/30 rounded-xl transition-all duration-300 group shadow-lg hover:shadow-blue-400/10"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold group-hover:text-blue-400 transition-colors">Portfolio</p>
                  <p className="text-gray-400 text-xs">fragnite.vercel.app</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
              </a>
            </div>

            {/* Socials */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider flex items-center">
                <span className="w-2 h-2 bg-pink-400 rounded-full mr-2" />
                Socials
              </h3>
              <div className="space-y-2">
                {/* LinkedIn */}
                <a 
                  href="https://linkedin.com/in/iaryasharma" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gradient-to-r from-[#1f1f24] to-[#25252a] hover:from-[#2a2a30] hover:to-[#30303a] border border-gray-700/50 hover:border-blue-500/30 rounded-xl transition-all duration-300 group shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="w-10 h-10 bg-[#0077B5] rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold group-hover:text-blue-400 transition-colors">LinkedIn</p>
                    <p className="text-gray-400 text-xs">iaryasharma</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                </a>

                {/* Instagram */}
                <a 
                  href="https://instagram.com/i.aryasharma" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gradient-to-r from-[#1f1f24] to-[#25252a] hover:from-[#2a2a30] hover:to-[#30303a] border border-gray-700/50 hover:border-pink-500/30 rounded-xl transition-all duration-300 group shadow-lg hover:shadow-pink-500/10"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold group-hover:text-pink-400 transition-colors">Instagram</p>
                    <p className="text-gray-400 text-xs">i.aryasharma</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-pink-400 transition-colors" />
                </a>

                {/* X (Twitter) */}
                <a 
                  href="https://twitter.com/iaryasharma" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gradient-to-r from-[#1f1f24] to-[#25252a] hover:from-[#2a2a30] hover:to-[#30303a] border border-gray-700/50 hover:border-gray-400/30 rounded-xl transition-all duration-300 group shadow-lg hover:shadow-gray-400/10"
                >
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold group-hover:text-gray-300 transition-colors">X (Twitter)</p>
                    <p className="text-gray-400 text-xs">iaryasharma</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}