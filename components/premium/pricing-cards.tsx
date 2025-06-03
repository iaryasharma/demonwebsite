"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown } from "lucide-react";
import Image from "next/image";

export function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
      {/* Demon Prime */}
      <Card className="glass-dark border-[#00FF85]/30 overflow-hidden relative transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,255,133,0.3)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00FF85] to-blue-500"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#00FF85] to-blue-500 rounded-full opacity-20"></div>
        <CardHeader className="pb-0">
          <div className="flex items-center mb-2">
            <div className="mr-3 bg-gradient-to-br from-[#00FF85]/20 to-blue-500/20 p-2 rounded-full select-none" style={{ pointerEvents: 'none' }}>
              <Image src="/Demon-Prime.png" alt="Demon Prime" width={48} height={48} className="mr-0" draggable={false} />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Demon Prime</CardTitle>
          </div>
          <p className="text-gray-400">
            The perfect plan for small to medium servers looking for premium features.
          </p>
        </CardHeader>        <CardContent className="pt-6">
          <div className="flex items-baseline mb-8">
            <span className="text-gray-400 text-2xl">$</span>
            <span className="text-5xl font-bold text-white">5</span>
            <span className="text-gray-400 ml-2">/month</span>
          </div>

          <ul className="space-y-3">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-[#00FF85] mr-2 flex-shrink-0" />
              <span className="text-gray-300">Everything from free plan</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-[#00FF85] mr-2 flex-shrink-0" />
              <span className="text-gray-300">No-Prefix</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-[#00FF85] mr-2 flex-shrink-0" />
              <span className="text-gray-300">Customized giveaways</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-[#00FF85] mr-2 flex-shrink-0" />
              <span className="text-gray-300">Everything Unlimited</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-[#00FF85] mr-2 flex-shrink-0" />
              <span className="text-gray-300">Welcome Image</span>
            </li>
          </ul>
        </CardContent>        <CardFooter>
          <Button 
            className="w-full bg-[#00FF85] text-black hover:bg-[#00FF85]/80"
            onClick={() => window.open('https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20identify%20guilds%20applications.commands&response_type=code&permissions=1513962695871&state=QGn-6VzBYf2Ta8nMk_tFe', '_blank')}
          >
            Get Started
          </Button>
        </CardFooter>
      </Card>

      {/* Demon Pro */}
      <Card className="glass-dark border-purple-500/30 overflow-hidden relative transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00FF85] to-purple-500"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-500 to-[#00FF85] rounded-full opacity-20"></div>
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium px-3 py-1">Most Popular</Badge>
        </div>
        <CardHeader className="pb-0">
          <div className="flex items-center mb-2">
            <div className="relative mr-3 bg-gradient-to-br from-purple-500/20 to-[#00FF85]/20 p-2 rounded-full select-none" style={{ pointerEvents: 'none' }}>
              <Image src="/Demon-Prime.png" alt="Demon Pro" width={48} height={48} draggable={false} />
              <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                <Crown className="h-4 w-4 text-black" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Demon Pro</CardTitle>
          </div>          <p className="text-gray-400">
            Ultimate power for large communities and professional server management.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-baseline mb-8">
            <span className="text-gray-400 text-2xl">$</span>
            <span className="text-5xl font-bold text-white">9</span>
            <span className="text-gray-400 text-xl">.99</span>
            <span className="text-gray-400 ml-2">/month</span>
          </div>

          <ul className="space-y-3">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-[#00FF85] mr-2 flex-shrink-0" />
              <span className="text-gray-300">Everything from Demon Prime</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-[#00FF85] mr-2 flex-shrink-0" />
              <span className="text-gray-300">No-Prefix</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-[#00FF85] mr-2 flex-shrink-0" />
              <span className="text-gray-300">Customized giveaways</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-[#00FF85] mr-2 flex-shrink-0" />
              <span className="text-gray-300">Everything Unlimited</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-[#00FF85] mr-2 flex-shrink-0" />
              <span className="text-gray-300">Welcome Image</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-[#00FF85] mr-2 flex-shrink-0" />
              <span className="text-gray-300">Auto Recovery</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-[#00FF85] mr-2 flex-shrink-0" />
              <span className="text-gray-300">Premium Support</span>
            </li>
          </ul>
        </CardContent>        <CardFooter>
          <Button 
            className="w-full bg-gradient-to-r from-[#00FF85] to-purple-500 text-black hover:opacity-90"
            onClick={() => window.open('https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20identify%20guilds%20applications.commands&response_type=code&permissions=1513962695871&state=QGn-6VzBYf2Ta8nMk_tFe', '_blank')}
          >
            Get Started
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
