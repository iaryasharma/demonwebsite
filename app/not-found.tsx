"use client";

import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Bot } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

export default function NotFound() {
  // Prevent image downloads
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

  return (    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden flex items-center justify-center pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00FF85]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* 404 Hero */}
        <div className="mb-8">
          <div className="relative mb-8">
            <div className="select-none" style={{ pointerEvents: 'none' }}>
              <Image 
                src="/demon-logo.png" 
                alt="Demon Bot" 
                width={120} 
                height={120} 
                className="mx-auto opacity-50 grayscale"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
            </div>
          </div>
          
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-white via-[#00FF85] to-white bg-clip-text text-transparent mb-4 animate-pulse">
            404
          </h1>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Oops! It looks like this page wandered off into the digital void. Even our demon bot couldn't find it!
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-white mb-4">What happened?</h3>
          <ul className="text-slate-300 space-y-2 text-left">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-[#00FF85] rounded-full mr-3"></span>
              The page you're looking for might have been moved or deleted
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-[#00FF85] rounded-full mr-3"></span>
              You might have typed the URL incorrectly
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-[#00FF85] rounded-full mr-3"></span>
              The link you followed might be broken or outdated
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-[#00FF85] to-emerald-400 text-black hover:from-[#00FF85]/90 hover:to-emerald-400/90 text-lg px-8 py-6 rounded-xl transform transition-all hover:scale-105 font-medium shadow-lg shadow-[#00FF85]/25"
            >
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => window.history.back()}
            className="border-slate-600 hover:border-[#00FF85] hover:text-[#00FF85] hover:shadow-lg hover:shadow-[#00FF85]/10 bg-slate-800/50 backdrop-blur-sm text-lg px-8 py-6 rounded-xl transform transition-all hover:scale-105 font-medium"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>        {/* Help Text */}
        <div className="mt-12 text-slate-400">
          <p className="text-sm">
            Need help? Join our{" "}
            <a 
              href="https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20identify%20guilds%20applications.commands&response_type=code&permissions=1513962695871&state=QGn-6VzBYf2Ta8nMk_tFe" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#00FF85] hover:text-[#00FF85]/80 underline transition-colors"
            >
              Discord Server
            </a>
            {" "}for support
          </p>
        </div>
      </div>
    </div>
  );
}
