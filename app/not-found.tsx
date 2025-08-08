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
  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center">
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

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pt-20">
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
          
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-white via-[#8b5cf6] to-white bg-clip-text text-transparent mb-4 animate-pulse">
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
              <span className="w-2 h-2 bg-[#8b5cf6] rounded-full mr-3"></span>
              The page you're looking for might have been moved or deleted
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-[#8b5cf6] rounded-full mr-3"></span>
              You might have typed the URL incorrectly
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-[#8b5cf6] rounded-full mr-3"></span>
              The link you followed might be broken or outdated
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-[#8b5cf6] to-purple-400 text-black hover:from-[#8b5cf6]/90 hover:to-purple-400/90 text-lg px-8 py-6 rounded-xl transform transition-all hover:scale-105 font-medium shadow-lg shadow-[#8b5cf6]/25"
            >
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => window.history.back()}
            className="border-slate-600 hover:border-[#8b5cf6] hover:text-[#8b5cf6] hover:shadow-lg hover:shadow-[#8b5cf6]/10 bg-slate-800/50 backdrop-blur-sm text-lg px-8 py-6 rounded-xl transform transition-all hover:scale-105 font-medium"
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
              className="text-[#8b5cf6] hover:text-[#8b5cf6]/80 underline transition-colors"
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
