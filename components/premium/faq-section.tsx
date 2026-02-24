"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How do I upgrade to premium?",
    a: "Join our support server and use the !upgrade command. Our bot will guide you through the payment process securely.",
  },
  {
    q: "Can I switch between plans?",
    a: "Yes, you can upgrade or downgrade your plan at any time. The price difference will be prorated for your current billing cycle.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 7-day money-back guarantee if you're not satisfied with our premium features. No questions asked.",
  },
  {
    q: "How many servers can I use premium on?",
    a: "Premium features are applied to one server per subscription. For multiple servers, you'll need separate subscriptions.",
  },
];

function FaqItem({ item, index }: { item: (typeof faqs)[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`w-full text-left rounded-xl border transition-all duration-300 ${open
            ? "border-[#8b5cf6]/20 bg-[#8b5cf6]/[0.03]"
            : "border-white/[0.06] bg-white/[0.01] hover:border-white/[0.1] hover:bg-white/[0.02]"
          }`}
      >
        <div className="flex items-center justify-between p-5">
          <h3 className="text-sm font-semibold text-white pr-4">{item.q}</h3>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </motion.div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-0">
                <div className="h-px bg-white/[0.04] mb-4" />
                <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

export function FaqSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-16"
    >
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-500 text-sm">Got questions? We've got answers</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-3">
        {faqs.map((faq, i) => (
          <FaqItem key={faq.q} item={faq} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
