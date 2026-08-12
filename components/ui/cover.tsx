"use client"

import React, { useEffect, useId, useState, useRef } from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"

export const Cover = ({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) => {
  const [hovered, setHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [beamPositions, setBeamPositions] = useState<number[]>([])

  useEffect(() => {
    if (!ref.current) return
    const height = ref.current.clientHeight ?? 0
    setContainerWidth(ref.current.clientWidth ?? 0)
    // Cap beams — previously height/10 created dozens of infinite SVG animations
    const count = Math.min(4, Math.max(2, Math.floor(height / 18)))
    setBeamPositions(
      Array.from({ length: count }, (_, i) => ((i + 1) * height) / (count + 1)),
    )
  }, [])

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={ref}
      className="group/cover relative inline-block rounded-sm bg-neutral-100 px-2 py-2 transition duration-200 hover:bg-neutral-900 dark:bg-neutral-900"
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.2 } }}
            className="absolute inset-0 h-full w-full overflow-hidden"
          >
            {/* CSS sparkle field — no tsparticles */}
            <div
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
                animation: "cover-drift 8s linear infinite",
              }}
            />
            <style>{`
              @keyframes cover-drift {
                from { transform: translateX(0); }
                to { transform: translateX(-18px); }
              }
              @media (prefers-reduced-motion: reduce) {
                .group\\/cover [style*="cover-drift"] { animation: none !important; }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>

      {beamPositions.map((position, index) => (
        <Beam
          key={index}
          hovered={hovered}
          duration={1.8 + index * 0.35}
          delay={0.4 + index * 0.25}
          width={containerWidth}
          style={{ top: `${position}px` }}
        />
      ))}

      <motion.span
        animate={{ scale: hovered ? 0.96 : 1 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative z-20 inline-block text-neutral-900 transition duration-200 group-hover/cover:text-white dark:text-white",
          className,
        )}
      >
        {children}
      </motion.span>

      <CircleIcon className="absolute -right-[2px] -top-[2px]" />
      <CircleIcon className="absolute -bottom-[2px] -right-[2px]" />
      <CircleIcon className="absolute -left-[2px] -top-[2px]" />
      <CircleIcon className="absolute -bottom-[2px] -left-[2px]" />
    </div>
  )
}

export const Beam = ({
  className,
  delay,
  duration,
  hovered,
  width = 600,
  ...svgProps
}: {
  className?: string
  delay?: number
  duration?: number
  hovered?: boolean
  width?: number
} & React.ComponentProps<typeof motion.svg>) => {
  const id = useId()

  return (
    <motion.svg
      width={width ?? "600"}
      height="1"
      viewBox={`0 0 ${width ?? "600"} 1`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("absolute inset-x-0 w-full", className)}
      {...svgProps}
    >
      <motion.path d={`M0 0.5H${width ?? "600"}`} stroke={`url(#svgGradient-${id})`} />
      <defs>
        <motion.linearGradient
          id={`svgGradient-${id}`}
          key={String(hovered)}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: "0%", x2: "-5%", y1: 0, y2: 0 }}
          animate={{ x1: "110%", x2: "105%", y1: 0, y2: 0 }}
          transition={{
            duration: hovered ? 0.55 : duration ?? 2,
            ease: "linear",
            repeat: Infinity,
            delay: hovered ? 0.15 : delay ?? 1,
            repeatDelay: hovered ? 0.6 : delay ?? 1,
          }}
        >
          <stop stopColor="#2EB9DF" stopOpacity="0" />
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </motion.svg>
  )
}

export const CircleIcon = ({ className }: { className?: string; delay?: number }) => {
  return (
    <div
      className={cn(
        "pointer-events-none group h-2 w-2 rounded-full bg-neutral-600 opacity-20 group-hover/cover:bg-white group-hover/cover:opacity-100 dark:bg-white",
        className,
      )}
    />
  )
}
