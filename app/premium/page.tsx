"use client";

import { Button } from "@/components/ui/button"
import { Star, Sparkles } from "lucide-react"
import Image from "next/image"
import { useEffect } from "react"
import { PricingCards } from "@/components/premium/pricing-cards"
import { FeatureComparison } from "@/components/premium/feature-comparison"
import { FaqSection } from "@/components/premium/faq-section"

export default function PremiumPage() {
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
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="h-6 w-6 text-[#8b5cf6]" />
            <span className="text-sm uppercase tracking-wider text-[#8b5cf6]">Unlock Premium Power</span>
            <Sparkles className="h-6 w-6 text-[#8b5cf6]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-purple-500 glow-text">Premium Plans</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Unlock the full potential of Demon Bot with our premium subscription plans and take your Discord server to the next level
          </p>
        </div>
        
        {/* Hero Image */}
        <div className="mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
          <div className="rounded-lg overflow-hidden shadow-xl relative">
            <div className="select-none" style={{ pointerEvents: 'none' }}>
              <Image 
                src="/demon-banner.png" 
                alt="Demon Bot Premium" 
                width={1200} 
                height={400} 
                className="w-full h-64 md:h-80 object-cover"
                draggable={false}
                priority
              />
            </div>
            <div className="absolute inset-0 flex items-center z-20 p-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Power Up Your<br />Discord Experience</h2>
                <p className="text-xl text-gray-200 mb-6 max-w-lg">Join thousands of servers already enjoying premium features</p>
                <Button 
                  className="bg-gradient-to-r from-[#8b5cf6] to-purple-500 text-black hover:opacity-90 text-lg font-medium px-8 py-6"
                  onClick={() => window.open('https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20identify%20guilds%20applications.commands&response_type=code&permissions=1513962695871&state=QGn-6VzBYf2Ta8nMk_tFe', '_blank')}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <PricingCards />

        {/* Feature Comparison */}
        <FeatureComparison />

        {/* FAQ Section */}
        <FaqSection />

        {/* CTA */}
        <div className="text-center glass-dark border border-[#8b5cf6]/20 rounded-xl p-12 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#8b5cf6]/10 rounded-full blur-3xl"></div>
          
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Ready to supercharge your Discord server?</h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Join thousands of communities already enjoying premium features</p>
          
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-[#8b5cf6] to-purple-500 text-black hover:opacity-90 text-lg px-10 py-7 rounded-xl transform transition-all hover:scale-105 font-medium"
            onClick={() => window.open('https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20identify%20guilds%20applications.commands&response_type=code&permissions=1513962695871&state=QGn-6VzBYf2Ta8nMk_tFe', '_blank')}
          >
            <Star className="mr-2 h-5 w-5" />
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  )
}
