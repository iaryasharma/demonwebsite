"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function FeatureComparison() {
  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-purple-500 inline-block mb-4">Premium Features Comparison</h2>
        <p className="text-gray-300">Find the perfect plan for your Discord community</p>
      </div>
      <div className="glass-dark border border-[#8b5cf6]/20 rounded-lg p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#8b5cf6]/10 rounded-full blur-3xl"></div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-4 text-gray-300 font-medium">Feature</th>
                <th className="text-center py-4 px-4 text-gray-400 font-medium">Free</th>
                <th className="text-center py-4 px-4 text-[#8b5cf6] font-medium">Prime</th>
                <th className="text-center py-4 px-4 text-purple-400 font-medium">Pro</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-2 text-white">Basic Commands</td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-gray-400 mx-auto" />
                </td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-[#8b5cf6] mx-auto" />
                </td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-purple-400 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-2 text-white">Moderation</td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-gray-400 mx-auto" />
                </td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-[#8b5cf6] mx-auto" />
                </td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-purple-400 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-2 text-white">Anime Search</td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-gray-400 mx-auto" />
                </td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-[#8b5cf6] mx-auto" />
                </td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-purple-400 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-2 text-white">Custom Prefix</td>
                <td className="py-3 px-2 text-center">-</td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-[#8b5cf6] mx-auto" />
                </td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-purple-400 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-2 text-white">Custom Welcome Images</td>
                <td className="py-3 px-2 text-center">-</td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-[#8b5cf6] mx-auto" />
                </td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-purple-400 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-2 text-white">Advanced Giveaways</td>
                <td className="py-3 px-2 text-center">-</td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-[#8b5cf6] mx-auto" />
                </td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-purple-400 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-2 text-white">Auto Recovery</td>
                <td className="py-3 px-2 text-center">-</td>
                <td className="py-3 px-2 text-center">-</td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-purple-400 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-3 px-2 text-white">Premium Support</td>
                <td className="py-3 px-2 text-center">-</td>
                <td className="py-3 px-2 text-center">-</td>
                <td className="py-3 px-2 text-center">
                  <Check className="h-5 w-5 text-purple-400 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
