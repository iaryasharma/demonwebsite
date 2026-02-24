"use client";

import { motion } from "framer-motion";
import { Sparkles, Star, ArrowRight } from "lucide-react";
import { PricingCards } from "@/components/premium/pricing-cards";
import { FeatureComparison } from "@/components/premium/feature-comparison";
import { FaqSection } from "@/components/premium/faq-section";

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#8b5cf6]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-600/[0.03] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-indigo-500/[0.03] rounded-full blur-[100px]" />
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#a78bfa]" />
              <span className="text-xs font-medium text-[#a78bfa] uppercase tracking-widest">Premium Plans</span>
              <Sparkles className="w-3.5 h-3.5 text-[#a78bfa]" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Unlock the{" "}
              <span className="bg-gradient-to-r from-[#8b5cf6] via-purple-400 to-[#a78bfa] bg-clip-text text-transparent">
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
            <div className="relative rounded-2xl border border-white/[0.06] overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 via-transparent to-purple-600/10" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/40 to-transparent" />

              <div className="relative p-12 md:p-16">
                <Star className="w-8 h-8 text-[#a78bfa]/30 mx-auto mb-6" />
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
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-semibold text-sm hover:shadow-lg hover:shadow-[#8b5cf6]/25 transition-shadow"
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
