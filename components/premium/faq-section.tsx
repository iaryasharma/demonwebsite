"use client";

import { Zap, Clock, Shield, Gift } from "lucide-react";

export function FaqSection() {
  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-purple-500 inline-block mb-4">Frequently Asked Questions</h2>
        <p className="text-gray-300">Got questions? We've got answers</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-dark border border-[#8b5cf6]/20 rounded-lg p-6 transform transition-all duration-300 hover:border-[#8b5cf6]/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]">
          <div className="flex items-start">
            <div className="bg-gradient-to-br from-[#8b5cf6]/20 to-blue-500/20 p-2 rounded-full mr-4">
              <Zap className="h-5 w-5 text-[#8b5cf6]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-blue-300 mb-3">How do I upgrade to premium?</h3>
              <p className="text-gray-300">
                You can upgrade to premium by joining our support server and using the !upgrade command. Our bot will
                guide you through the payment process.
              </p>
            </div>
          </div>
        </div>
        <div className="glass-dark border border-[#8b5cf6]/20 rounded-lg p-6 transform transition-all duration-300 hover:border-[#8b5cf6]/40 hover:shadow-[0_0_15px_rgba(0,255,133,0.2)]">
          <div className="flex items-start">
            <div className="bg-gradient-to-br from-[#8b5cf6]/20 to-blue-500/20 p-2 rounded-full mr-4">
              <Clock className="h-5 w-5 text-[#8b5cf6]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-blue-300 mb-3">Can I switch between plans?</h3>
              <p className="text-gray-300">
                Yes, you can upgrade or downgrade your plan at any time. The price difference will be prorated for your
                current billing cycle.
              </p>
            </div>
          </div>
        </div>
        <div className="glass-dark border border-[#8b5cf6]/20 rounded-lg p-6 transform transition-all duration-300 hover:border-[#8b5cf6]/40 hover:shadow-[0_0_15px_rgba(0,255,133,0.2)]">
          <div className="flex items-start">
            <div className="bg-gradient-to-br from-[#8b5cf6]/20 to-blue-500/20 p-2 rounded-full mr-4">
              <Shield className="h-5 w-5 text-[#8b5cf6]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-blue-300 mb-3">Do you offer refunds?</h3>
              <p className="text-gray-300">
                We offer a 7-day money-back guarantee if you're not satisfied with our premium features.
              </p>
            </div>
          </div>
        </div>
        <div className="glass-dark border border-[#8b5cf6]/20 rounded-lg p-6 transform transition-all duration-300 hover:border-[#8b5cf6]/40 hover:shadow-[0_0_15px_rgba(0,255,133,0.2)]">
          <div className="flex items-start">
            <div className="bg-gradient-to-br from-[#8b5cf6]/20 to-blue-500/20 p-2 rounded-full mr-4">
              <Gift className="h-5 w-5 text-[#8b5cf6]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-blue-300 mb-3">How many servers can I use premium on?</h3>
              <p className="text-gray-300">
                Premium features are applied to one server per subscription. If you want to use premium features on
                multiple servers, you'll need separate subscriptions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
