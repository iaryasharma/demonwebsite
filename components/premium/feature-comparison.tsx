"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const features = [
  { name: "Basic Commands", free: true, prime: true, pro: true },
  { name: "Moderation", free: true, prime: true, pro: true },
  { name: "Anime Search", free: true, prime: true, pro: true },
  { name: "Custom Prefix", free: false, prime: true, pro: true },
  { name: "Custom Welcome Images", free: false, prime: true, pro: true },
  { name: "Advanced Giveaways", free: false, prime: true, pro: true },
  { name: "Auto Recovery", free: false, prime: false, pro: true },
  { name: "Premium Support", free: false, prime: false, pro: true },
];

function CellIcon({ available }: { available: boolean }) {
  return available ? (
    <div className="w-6 h-6 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center mx-auto">
      <Check className="w-3.5 h-3.5 text-[#a78bfa]" />
    </div>
  ) : (
    <X className="w-4 h-4 text-gray-600 mx-auto" />
  );
}

export function FeatureComparison() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-24"
    >
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Compare Plans</h2>
        <p className="text-gray-500 text-sm">Find the perfect plan for your community</p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.01]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Feature</th>
                <th className="text-center py-4 px-4 text-sm font-medium text-gray-500 w-24">Free</th>
                <th className="text-center py-4 px-4 text-sm font-medium text-[#a78bfa] w-24">Prime</th>
                <th className="text-center py-4 px-4 w-24">
                  <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Pro</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <motion.tr
                  key={f.name}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className={`border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors ${i === features.length - 1 ? "border-b-0" : ""
                    }`}
                >
                  <td className="py-3.5 px-6 text-sm text-gray-300">{f.name}</td>
                  <td className="py-3.5 px-4 text-center">
                    <CellIcon available={f.free} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <CellIcon available={f.prime} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <CellIcon available={f.pro} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
