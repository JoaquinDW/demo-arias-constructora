"use client"

import { cn } from "@/lib/utils"

interface AnimatedProgressProps {
  value: number
  className?: string
}

export function AnimatedProgress({ value, className }: AnimatedProgressProps) {
  return (
    <div
      className={cn(
        "relative w-full bg-gray-800 rounded-full overflow-hidden",
        className
      )}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-full blur-sm"></div>

      {/* Progress bar container */}
      <div className="relative h-8 bg-gray-800/80 rounded-full border border-gray-700">
        {/* Animated progress fill */}
        <div
          className="h-full bg-gradient-to-r from-[#ff0040] via-[#ff7a00] to-[#ff0040] rounded-full relative overflow-hidden transition-all duration-1000 ease-out neon-glow"
          style={{ width: `${Math.min(value, 100)}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>

          {/* Pulse effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/50 to-pink-400/50 animate-pulse"></div>
        </div>

        {/* Progress text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white drop-shadow-lg">
            {value.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Celebration effect when near completion */}
      {value > 90 && (
        <div className="absolute inset-0 animate-ping bg-gradient-to-r from-red-400/30 to-pink-400/30 rounded-full"></div>
      )}
    </div>
  )
}
