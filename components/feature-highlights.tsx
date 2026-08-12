"use client"

import { motion } from "framer-motion"
import {
  Shield,
  Users,
  Zap,
  TriangleAlert,
  UserPlus,
  Gift,
  CircleCheck,
} from "lucide-react"
import { GradientText } from "@/components/ui/gradient-text"

export function FeatureHighlights() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32" id="features">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <p className="text-xs font-bold tracking-[0.3em] text-[#8b5cf6] uppercase mb-5">Features</p>
        <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white">
          Everything your{" "}
          <GradientText text="server needs" variant="soft" />
        </h2>
        <p className="text-zinc-400 max-w-xl mx-auto text-base leading-relaxed">
          One bot to rule them all. Designed for modern communities.
        </p>
      </motion.div>

      {/* Bento Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:auto-rows-[300px]"
      >
        {/* Security — spans 2 cols */}
        <div className="group relative col-span-1 lg:col-span-2 overflow-hidden rounded-3xl bg-zinc-900/40 border border-white/5 p-8 transition-all hover:border-[#8b5cf6]/20 h-[300px] flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)] pointer-events-none" />
          <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="relative z-20 flex-1 w-full h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-6 rounded-full bg-[#8b5cf6] shadow-[0_0_15px_rgba(139,92,246,0.4)]" />
                <h3 className="text-xl font-semibold text-white">Security</h3>
              </div>
              <p className="text-zinc-400 max-w-xs leading-relaxed text-sm">
                Comprehensive protection suite. Intelligent automod, anti-nuke limits, and raid protection to keep your community safe.
              </p>
              {/* Mobile pills */}
              <div className="md:hidden mt-5 grid grid-cols-3 gap-2">
                {[
                  { icon: <Shield className="w-4 h-4 text-[#8b5cf6]" />, label: "Anti-Nuke", color: "bg-[#8b5cf6]" },
                  { icon: <Users className="w-4 h-4 text-[#8b5cf6]" />, label: "Anti-Raid", color: "bg-[#8b5cf6]" },
                  { icon: <Zap className="w-4 h-4 text-amber-400" />, label: "Auto-Mod", color: "bg-amber-400" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-3 bg-zinc-950/60 rounded-xl border border-white/[0.06]">
                    {item.icon}
                    <span className="text-[10px] font-semibold text-zinc-300 text-center leading-tight">{item.label}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.color} shadow-sm`} />
                  </div>
                ))}
              </div>
            </div>
            {/* Desktop protection card */}
            <div className="hidden md:flex flex-1 w-full max-w-[17rem] h-full items-center justify-center">
              <div className="w-full bg-zinc-950/60 rounded-2xl border border-white/[0.06] p-4 group-hover:border-[#8b5cf6]/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.06]">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Protection</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-pulse" />
                    <span className="text-[10px] text-[#8b5cf6] font-bold tracking-wider">ACTIVE</span>
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  {[
                    { icon: <Shield className="w-3 h-3 text-[#8b5cf6]" />, label: "Anti-Nuke", color: "text-[#8b5cf6] bg-[#8b5cf6]/10" },
                    { icon: <Users className="w-3 h-3 text-[#8b5cf6]" />, label: "Anti-Raid", color: "text-[#8b5cf6] bg-[#8b5cf6]/10" },
                    { icon: <Zap className="w-3 h-3 text-amber-400" />, label: "Auto-Mod", color: "text-amber-400 bg-amber-400/10" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-2.5 py-2 bg-zinc-900/60 rounded-lg">
                      <div className="flex items-center gap-2">{item.icon}<span className="text-[11px] text-zinc-300 font-medium">{item.label}</span></div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.color}`}>ON</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 px-2.5 py-2 bg-red-500/[0.06] rounded-lg border border-red-500/10">
                  <TriangleAlert className="w-2.5 h-2.5 text-red-400 flex-shrink-0" />
                  <span className="text-[10px] text-red-400/80 font-mono truncate">Raid blocked — 14 members kicked</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Moderation */}
        <div className="group relative overflow-hidden rounded-3xl bg-zinc-900/40 border border-white/5 p-6 transition-all hover:border-red-400/20 h-[300px] flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 rounded-full bg-red-400 shadow-[0_0_15px_rgba(248,113,113,0.4)]" />
              <h3 className="text-xl font-semibold text-white">Moderation</h3>
            </div>
            <p className="text-zinc-400 mb-4 text-sm">Advanced mod tools for any community.</p>
            <div className="flex-1 w-full flex items-center justify-center pt-2">
              <div className="w-full bg-zinc-950/50 rounded-xl border border-white/5 p-4 flex flex-col gap-4 group-hover:border-red-500/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200">cr4ck.j4ck</div>
                      <div className="text-[10px] text-red-400 font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                        Active Alert
                      </div>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded bg-red-500/10 border border-red-500/10 text-[9px] font-bold text-red-500 uppercase tracking-wider">Warn: 3</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 text-[10px] font-bold py-2.5 rounded-lg transition-all">
                    <Shield className="w-3 h-3" /> BAN
                  </button>
                  <button className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 hover:border-white/10 text-[10px] font-bold py-2.5 rounded-lg transition-all">TIMEOUT</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Logging (auto-scrolling logs) ─── */}
        <div className="group relative overflow-hidden rounded-3xl bg-zinc-900/40 border border-white/5 p-8 transition-all hover:border-amber-400/20 col-span-1 h-[300px]">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1.5 h-6 rounded-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]" />
              <h3 className="text-xl font-semibold text-white">Logging</h3>
            </div>
            <p className="text-zinc-400 mb-3 text-sm">Permanent record of every server event. Audit anything, anytime.</p>
            {/* Scrolling container */}
            <div className="flex-1 overflow-hidden relative rounded-xl border border-white/5 bg-zinc-950/50">
              {/* top fade mask */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-zinc-950 to-transparent z-10 pointer-events-none" />
              <style>{`
                @keyframes logScroll {
                  0%   { transform: translateY(0); }
                  100% { transform: translateY(-50%); }
                }
                .log-scroll { animation: logScroll 10s linear infinite; }
              `}</style>
              <div className="log-scroll p-3 pt-4">
                {[
                  { tag: "[WARN]", msg: "User warned for Caps Lock", color: "text-orange-300" },
                  { tag: "[UNBAN]", msg: "User123 unbanned by Admin", color: "text-green-300" },
                  { tag: "[GIVEAWAY]", msg: "Giveaway started in #news", color: "text-purple-300" },
                  { tag: "[BAN]", msg: "Spambot banned by AutoMod", color: "text-red-400" },
                  { tag: "[JOIN]", msg: "User82 joined the server", color: "text-green-400" },
                  { tag: "[EDIT]", msg: "Message edited in #general", color: "text-blue-400" },
                  { tag: "[VOICE]", msg: "Admin joined Voice Chat", color: "text-purple-400" },
                  { tag: "[ROLE]", msg: "Member role added to User", color: "text-yellow-400" },
                  { tag: "[INVITE]", msg: "Invite created by Moderator", color: "text-pink-400" },
                  { tag: "[KICK]", msg: "Troll#1234 kicked by Mod", color: "text-red-300" },
                  /* duplicate for seamless loop */
                  { tag: "[WARN]", msg: "User warned for Caps Lock", color: "text-orange-300" },
                  { tag: "[UNBAN]", msg: "User123 unbanned by Admin", color: "text-green-300" },
                  { tag: "[GIVEAWAY]", msg: "Giveaway started in #news", color: "text-purple-300" },
                  { tag: "[BAN]", msg: "Spambot banned by AutoMod", color: "text-red-400" },
                  { tag: "[JOIN]", msg: "User82 joined the server", color: "text-green-400" },
                  { tag: "[EDIT]", msg: "Message edited in #general", color: "text-blue-400" },
                  { tag: "[VOICE]", msg: "Admin joined Voice Chat", color: "text-purple-400" },
                  { tag: "[ROLE]", msg: "Member role added to User", color: "text-yellow-400" },
                  { tag: "[INVITE]", msg: "Invite created by Moderator", color: "text-pink-400" },
                  { tag: "[KICK]", msg: "Troll#1234 kicked by Mod", color: "text-red-300" },
                ].map((log, i) => (
                  <div key={i} className="flex gap-2 font-mono text-[10px] text-zinc-500 mb-1.5">
                    <span className={`${log.color} flex-shrink-0`}>{log.tag}</span>
                    <span className="truncate">{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Self Roles */}
        <div className="group relative overflow-hidden rounded-3xl bg-zinc-900/40 border border-white/5 p-8 transition-all hover:border-violet-400/20 col-span-1 h-[300px]">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-6 rounded-full bg-violet-400 shadow-[0_0_15px_rgba(167,139,250,0.4)]" />
              <h3 className="text-xl font-semibold text-white">Self Roles</h3>
            </div>
            <p className="text-zinc-400 mb-4 text-sm">Let members unlock channels and notifications themselves.</p>
            <div className="mt-auto bg-zinc-950/80 rounded-xl p-4 border border-white/10 flex flex-col gap-2">
              {[
                { emoji: "🔔", label: "Announcements", active: true },
                { emoji: "🎮", label: "Events", active: false },
                { emoji: "🎨", label: "Design", active: false, muted: true },
              ].map((role, i) => (
                <div key={i} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${role.active ? "bg-violet-500/10 border border-violet-500/20" : "bg-zinc-900 border border-white/5 group-hover:bg-zinc-800"} ${role.muted ? "opacity-60" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span>{role.emoji}</span>
                    <span className={`text-[10px] font-bold ${role.active ? "text-violet-200" : "text-zinc-400"}`}>{role.label}</span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${role.active ? "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]" : "bg-zinc-800 border-2 border-zinc-700"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Verification (replaces Invite Tracker) ─── */}
        <div className="group relative overflow-hidden rounded-3xl bg-zinc-900/40 border border-white/5 p-8 transition-all hover:border-cyan-400/20 col-span-1 h-[300px]">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
              <h3 className="text-xl font-semibold text-white">Verification</h3>
            </div>
            <p className="text-zinc-400 mb-3 text-sm">Protect your server with smart CAPTCHA-based verification gates.</p>
            <div className="mt-auto bg-zinc-950/80 rounded-xl p-4 border border-white/10 group-hover:border-cyan-500/20 transition-all flex flex-col gap-3">
              {/* CAPTCHA render */}
              <div className="w-full rounded-lg overflow-hidden border border-white/[0.08]">
                <div className="bg-[#0f0f1f] h-14 flex items-center justify-center relative overflow-hidden px-3">
                  {/* noise lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 220 56" preserveAspectRatio="none">
                    <line x1="0" y1="22" x2="220" y2="37" stroke="#7c3aed" strokeWidth="1.2" />
                    <line x1="0" y1="44" x2="220" y2="16" stroke="#06b6d4" strokeWidth="1" />
                    <line x1="35" y1="0" x2="65" y2="56" stroke="#ec4899" strokeWidth="0.8" />
                    <line x1="145" y1="0" x2="115" y2="56" stroke="#f59e0b" strokeWidth="0.7" />
                    <line x1="85" y1="6" x2="125" y2="52" stroke="#10b981" strokeWidth="0.6" />
                    <line x1="170" y1="8" x2="190" y2="48" stroke="#f87171" strokeWidth="0.5" />
                  </svg>
                  {/* CAPTCHA letters */}
                  <div className="flex items-center gap-1.5 relative z-10">
                    {["Q", "K", "W", "Y", "N", "H"].map((ch, i) => (
                      <span
                        key={i}
                        className="text-xl font-black font-mono select-none"
                        style={{
                          color: ["#f87171", "#34d399", "#a78bfa", "#fbbf24", "#60a5fa", "#f472b6"][i],
                          transform: `rotate(${[-8, 5, -6, 9, -4, 7][i]}deg) translateY(${[1, -2, 3, -1, 2, -3][i]}px)`,
                          display: "inline-block",
                          textShadow: `0 0 8px ${["#f87171", "#34d399", "#a78bfa", "#fbbf24", "#60a5fa", "#f472b6"][i]}40`,
                        }}
                      >{ch}</span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Input row */}
              <div className="flex gap-2 items-center">
                <div className="flex-1 h-8 bg-zinc-900 rounded-lg border border-white/10 px-3 flex items-center">
                  <span className="text-[11px] text-zinc-600 font-mono tracking-widest">Enter CAPTCHA...</span>
                </div>
                <button className="h-8 px-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold hover:bg-cyan-500/20 transition-all">✓ Verify</button>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
                Awaiting verification from 3 members
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: Automation + Tickets */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

          {/* ─── Automation — 3/5 width ─── */}
          <div className="group relative overflow-hidden rounded-3xl bg-zinc-900/40 border border-white/5 p-8 transition-all hover:border-[#8b5cf6]/20 lg:col-span-3 min-h-[300px] flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 rounded-full bg-[#8b5cf6] shadow-[0_0_15px_rgba(139,92,246,0.4)]" />
                <h3 className="text-xl font-semibold text-white">Automation</h3>
              </div>
              <p className="text-zinc-400 text-sm mt-2 mb-4">Create complex workflows. Limitless possibilities.</p>
              <div className="mt-auto relative w-full h-[200px] bg-zinc-950/50 rounded-xl border border-white/5 overflow-hidden flex items-center group-hover:border-[#8b5cf6]/20 transition-colors">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] rounded-xl [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-50" />
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    {/* On Join → Send DM: purple to green */}
                    <linearGradient id="lineGradient1" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0.9" />
                    </linearGradient>
                    {/* On Join → Add Role: purple to blue */}
                    <linearGradient id="lineGradient2" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  <path d="M 15 50 C 50 50, 50 25, 85 25" fill="none" stroke="url(#lineGradient1)" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="4 4" />
                  <path d="M 15 50 C 50 50, 50 75, 85 75" fill="none" stroke="url(#lineGradient2)" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="4 4" />
                </svg>
                {/* On Join node — Primary purple */}
                <div className="absolute left-[15%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
                  <div className="w-12 h-12 bg-zinc-900 border border-[#8b5cf6] rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center justify-center text-[#8b5cf6] relative">
                    <div className="absolute inset-0 bg-[#8b5cf6]/10 rounded-xl animate-pulse" />
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="bg-zinc-900/80 backdrop-blur px-2 py-1 rounded border border-white/10 text-[10px] text-zinc-300 font-mono whitespace-nowrap">On Join</div>
                </div>
                {/* Send DM node — green */}
                <div className="absolute left-[85%] top-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
                  <div className="w-10 h-10 bg-zinc-900 border border-green-500/60 rounded-lg flex items-center justify-center text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.2)]">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div className="bg-zinc-900/80 backdrop-blur px-2 py-1 rounded border border-white/10 text-[9px] text-zinc-400 font-mono whitespace-nowrap">Send DM</div>
                </div>
                {/* Add Role node — blue */}
                <div className="absolute left-[85%] top-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
                  <div className="w-10 h-10 bg-zinc-900 border border-blue-500/60 rounded-lg flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="bg-zinc-900/80 backdrop-blur px-2 py-1 rounded border border-white/10 text-[9px] text-zinc-400 font-mono whitespace-nowrap">Add Role</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets — 2/5 width */}
          <div className="group relative overflow-hidden rounded-3xl bg-zinc-900/40 border border-white/5 p-8 transition-all hover:border-blue-400/20 lg:col-span-2 min-h-[300px] flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-6 rounded-full bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]" />
                <h3 className="text-xl font-semibold text-white">Tickets</h3>
              </div>
              <p className="text-zinc-400 mb-6 text-sm">Streamlined support ticket system for your community.</p>
              <div className="mt-auto w-full grid grid-cols-3 gap-2 bg-zinc-950/50 p-2 rounded-xl border border-white/5 group-hover:border-blue-500/20 transition-all h-[140px]">
                {/* Open */}
                <div className="flex flex-col gap-2">
                  <div className="text-[9px] font-bold text-zinc-500 uppercase px-1">Open</div>
                  <div className="flex-1 bg-zinc-900/50 rounded-lg border border-white/5 p-1.5 flex flex-col gap-1.5">
                    <div className="bg-zinc-800 p-1.5 rounded border border-white/5">
                      <div className="w-8 h-1 bg-zinc-600 rounded-full mb-1" />
                      <div className="w-4 h-1 bg-red-500/50 rounded-full" />
                    </div>
                    <div className="bg-zinc-800 p-1.5 rounded border border-white/5 opacity-50">
                      <div className="w-6 h-1 bg-zinc-600 rounded-full" />
                    </div>
                  </div>
                </div>
                {/* Active */}
                <div className="flex flex-col gap-2">
                  <div className="text-[9px] font-bold text-blue-400 uppercase px-1">Active</div>
                  <div className="flex-1 bg-blue-500/5 rounded-lg border border-blue-500/10 p-1.5 flex flex-col gap-1.5">
                    <div className="bg-zinc-800 p-1.5 rounded border border-blue-500/30">
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-10 h-1 bg-zinc-200 rounded-full" />
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                      </div>
                      <div className="flex -space-x-1">
                        <div className="w-2 h-2 rounded-full bg-zinc-600 border border-zinc-800" />
                        <div className="w-2 h-2 rounded-full bg-zinc-600 border border-zinc-800" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Done */}
                <div className="flex flex-col gap-2">
                  <div className="text-[9px] font-bold text-green-500 uppercase px-1">Done</div>
                  <div className="flex-1 bg-green-500/5 rounded-lg border border-green-500/10 p-1.5 flex flex-col gap-1.5 opacity-60">
                    {[0, 1].map((i) => (
                      <div key={i} className="bg-zinc-800 p-1.5 rounded border border-green-500/30 flex items-center gap-1">
                        <CircleCheck className="w-2 h-2 text-green-500" />
                        <div className={`${i === 0 ? "w-6" : "w-8"} h-1 bg-zinc-500 rounded-full`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
