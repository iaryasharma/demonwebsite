"use client"

import { cn } from "@/lib/utils"

interface GradientTextProps {
  text: string
  className?: string
  /** violet = brand purple shimmer; soft = white fade used in feature headers */
  variant?: "violet" | "soft"
}

/**
 * GPU-friendly animated gradient text. Replaces the old CanvasText
 * implementation that called canvas.toDataURL() every animation frame.
 */
export function GradientText({
  text,
  className,
  variant = "violet",
}: GradientTextProps) {
  return (
    <span
      className={cn(
        "inline-block bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-x",
        variant === "violet" &&
          "bg-gradient-to-r from-[#7c3aed] via-[#c4b5fd] to-[#8b5cf6]",
        variant === "soft" &&
          "bg-gradient-to-r from-white via-white/70 to-white/40",
        className,
      )}
      style={{ WebkitBackgroundClip: "text" }}
    >
      {text}
    </span>
  )
}
