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
        "relative w-full bg-neutral-100 overflow-hidden border-2 border-[#171717]",
        className
      )}
    >
      <div
        className="h-full bg-[#72BF44] transition-all duration-1000 ease-out border-r-2 border-[#171717]"
        style={{
          width: `${Math.min(value, 100)}%`,
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 7px, rgba(23,23,23,0.12) 7px, rgba(23,23,23,0.12) 14px)",
        }}
      />
    </div>
  )
}
