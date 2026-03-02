"use client";

import { motion } from "framer-motion";
import { Check, Crown, Zap } from "lucide-react";
import Image from "next/image";

const INVITE_URL =
  "https://discord.com/oauth2/authorize?client_id=836880109478608897&scope=bot%20applications.commands&permissions=1513962695871";

interface PlanFeature {
  text: string;
  highlight?: boolean;
  comingSoon?: boolean;
}

const plans = [
  {
    name: "Demon Prime",
    icon: "/Demon-Prime.png",
    price: "5",
    priceSuffix: "",
    period: "/month",
    description: "Great for small & medium servers looking for premium features.",
    accent: "from-[#8b5cf6] to-[#7c3aed]",
    accentBorder: "border-[#8b5cf6]/15 hover:border-[#8b5cf6]/30",
    iconBg: "from-[#8b5cf6]/10 to-[#7c3aed]/10",
    badge: null,
    features: [
      { text: "Everything from the free plan" },
      { text: "Custom welcome images" },
      { text: "Advanced giveaway embed builder" },
      { text: "Full dashboard module access" },
      { text: "No-prefix mode", comingSoon: true },
      { text: "Reduced command cooldowns", comingSoon: true },
    ] as PlanFeature[],
  },
  {
    name: "Demon Pro",
    icon: "/Demon-Prime.png",
    price: "9",
    priceSuffix: ".99",
    period: "/month",
    description: "Ultimate power for large communities & professional management.",
    accent: "from-[#8b5cf6] to-[#6d28d9]",
    accentBorder: "border-[#8b5cf6]/30 hover:border-[#8b5cf6]/50",
    iconBg: "from-[#8b5cf6]/20 to-[#6d28d9]/20",
    badge: "Most Popular",
    features: [
      { text: "Everything from Demon Prime" },
      { text: "Dedicated support channel", highlight: true },
      { text: "Early access to new features", highlight: true },
      { text: "Auto recovery on crashes", highlight: true, comingSoon: true },
      { text: "Multi-server premium", comingSoon: true },
    ] as PlanFeature[],
  },
];

export function PricingCards() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24"
    >
      {plans.map((plan, i) => (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.15, duration: 0.5 }}
          whileHover={{ y: -6 }}
          className="group relative"
        >
          {/* Glow on hover */}
          <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${plan.accent} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 blur-sm`} />

          <div className={`relative h-full rounded-2xl border ${plan.accentBorder} bg-white/[0.02] backdrop-blur-sm transition-all duration-300 overflow-hidden`}>
            {/* Top accent line */}
            <div className={`h-px bg-gradient-to-r ${plan.accent}`} />

            {/* Badge */}
            {plan.badge && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[11px] font-bold text-[#a78bfa] uppercase tracking-wider backdrop-blur-md">
                  <Crown className="w-3 h-3" />
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="p-7 pb-0">
              {/* Icon + Name */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.iconBg} flex items-center justify-center select-none`} style={{ pointerEvents: "none" }}>
                  <Image src={plan.icon} alt={plan.name} width={32} height={32} draggable={false} />
                </div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">{plan.description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-gray-500 text-lg">$</span>
                <span className="text-5xl font-bold text-white tracking-tight">{plan.price}</span>
                {plan.priceSuffix && <span className="text-2xl font-bold text-gray-400">{plan.priceSuffix}</span>}
                <span className="text-gray-500 ml-1">{plan.period}</span>
              </div>
            </div>

            {/* Features */}
            <div className="px-7 pb-4">
              <div className="h-px bg-white/[0.04] mb-5" />
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${f.highlight ? "bg-[#8b5cf6]/20" : "bg-white/[0.04]"}`}>
                      <Check className={`w-3 h-3 ${f.highlight ? "text-[#a78bfa]" : "text-gray-400"}`} />
                    </div>
                    <span className={`text-sm ${f.highlight ? "text-[#c4b5fd] font-medium" : "text-gray-300"}`}>
                      {f.text}
                    </span>                    {f.comingSoon && (
                      <span className="ml-auto text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                        Soon
                      </span>
                    )}                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="p-7 pt-4">
              <motion.a
                href={INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${plan.badge
                  ? "bg-[#8b5cf6] text-white hover:bg-[#7c3aed] hover:shadow-lg hover:shadow-[#8b5cf6]/20"
                  : "bg-white/[0.04] text-white hover:bg-white/[0.08] border border-white/[0.08]"
                  }`}
              >
                Get Started
              </motion.a>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
