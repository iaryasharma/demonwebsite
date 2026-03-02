"use client";

import { motion } from "framer-motion";
import { Sparkles, Star, ArrowRight } from "lucide-react";
import { PricingCards } from "@/components/premium/pricing-cards";
import { FeatureComparison } from "@/components/premium/feature-comparison";
import { FaqSection } from "@/components/premium/faq-section";

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Ambient glassmorphism background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#8b5cf6]/[0.05] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Hero / Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] mb-8 backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8b5cf6]" />
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-widest">Premium Plans</span>
              <Sparkles className="w-3.5 h-3.5 text-[#8b5cf6]" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Unlock the{" "}
              <span className="bg-gradient-to-r from-[#8b5cf6] to-[#c4b5fd] bg-clip-text text-transparent drop-shadow-sm">
                full power
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
              Take your Discord server to the next level with premium features, priority support, and unlimited access.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <PricingCards />

          {/* Feature Comparison */}
          <FeatureComparison />

          {/* FAQ Section */}
          <FaqSection />

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mt-8 mb-8"
          >
            <div className="relative rounded-2xl border border-white/[0.05] overflow-hidden bg-white/[0.02] backdrop-blur-sm">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/40 to-transparent" />

              <div className="relative p-12 md:p-16">
                <Star className="w-8 h-8 text-[#8b5cf6] mx-auto mb-6 opacity-30" />
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Ready to supercharge your server?
                </h3>
                <p className="text-gray-400 mb-10 max-w-lg mx-auto">
                  Join thousands of communities already enjoying premium features and priority support.
                </p>

                <motion.a
                  href="https://discord.gg/demonbot"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold text-sm hover:shadow-lg hover:shadow-[#8b5cf6]/20 transition-all duration-300 cursor-pointer"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </motion.a>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
