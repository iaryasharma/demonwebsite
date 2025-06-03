"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  BarChart3,
  Clock,
  Sparkles,
  Wrench,
  ExternalLink,
  Monitor,
  Palette,
  Code
} from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export default function DashboardPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00FF85]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-pulse delay-500" />
      </div>
      
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Coming Soon Hero */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="select-none" style={{ pointerEvents: 'none' }}>
                  <Image 
                    src="/demon-logo.png" 
                    alt="Demon Bot" 
                    width={80} 
                    height={80} 
                    className="mr-4"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
                <div className="absolute inset-0 bg-[#00FF85]/20 rounded-full blur-md mr-4" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-[#00FF85] to-white bg-clip-text text-transparent drop-shadow-2xl">
                Dashboard
              </h1>
              <div className="relative">
                <Wrench className="w-10 h-10 text-[#00FF85] ml-4 animate-bounce" />
                <div className="absolute inset-0 w-10 h-10 bg-[#00FF85]/20 rounded-full blur-md ml-4" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-[#00FF85]/10 via-blue-500/10 to-purple-500/10 rounded-2xl p-8 mb-8 backdrop-blur-xl border border-slate-700/50">
              <div className="flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-[#00FF85] mr-3 animate-pulse" />
                <Badge className="bg-gradient-to-r from-[#00FF85] to-emerald-400 text-black font-semibold text-lg px-6 py-2">
                  Coming Soon
                </Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Dashboard Under Construction
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                We're working hard to bring you an amazing dashboard experience. Soon you'll be able to manage your server settings, monitor bot performance, and customize features all from one powerful interface.
              </p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="bg-slate-900/50 border-slate-700/50 hover:border-[#00FF85]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00FF85]/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-[#00FF85]">
                  <Settings className="mr-3 h-6 w-6" />
                  Server Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">Complete control over your server's bot configuration</p>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00FF85] rounded-full mr-3"></span>
                    Custom prefixes and commands
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00FF85] rounded-full mr-3"></span>
                    Channel-specific permissions
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00FF85] rounded-full mr-3"></span>
                    Moderation settings
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-400">
                  <BarChart3 className="mr-3 h-6 w-6" />
                  Analytics & Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">Detailed insights into your server's activity</p>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Command usage statistics
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    User activity tracking
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Performance metrics
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-400">
                  <Palette className="mr-3 h-6 w-6" />
                  Customization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">Personalize your bot's appearance and behavior</p>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                    Custom embed builder
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                    Welcome message designer
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                    Theme customization
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Development Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#00FF85] to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-black" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Phase 1</h4>
                <p className="text-slate-300 text-sm">Core functionality development</p>
                <Badge className="mt-2 bg-[#00FF85]/20 text-[#00FF85] border-[#00FF85]/30">In Progress</Badge>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Monitor className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Phase 2</h4>
                <p className="text-slate-300 text-sm">Beta testing & refinement</p>
                <Badge variant="outline" className="mt-2 border-slate-600 text-slate-400">Upcoming</Badge>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Phase 3</h4>
                <p className="text-slate-300 text-sm">Public release & launch</p>
                <Badge variant="outline" className="mt-2 border-slate-600 text-slate-400">Q2 2025</Badge>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-slate-900/50 via-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Want to be the first to know when the dashboard launches? Join our Discord community for exclusive updates and early access!
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-[#00FF85] to-emerald-400 text-black hover:from-[#00FF85]/90 hover:to-emerald-400/90 text-lg px-8 py-6 rounded-xl transform transition-all hover:scale-105 font-medium shadow-lg shadow-[#00FF85]/25"
              onClick={() => window.open('https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20identify%20guilds%20applications.commands&response_type=code&permissions=1513962695871&state=QGn-6VzBYf2Ta8nMk_tFe', '_blank')}
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Join Discord
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
