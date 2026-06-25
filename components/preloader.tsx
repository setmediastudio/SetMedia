"use client"

import { useEffect, useState } from "react"
import { Camera } from "lucide-react"
import { cn } from "@/lib/utils"

interface PreloaderProps {
  className?: string
}

export function Preloader({ className }: PreloaderProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    setIsExiting(true)
  }, [isHydrated])

  if (!isHydrated) {
    return (
      <div
        id="preloader"
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500",
          className
        )}
        style={{ opacity: 1 }}
      >
        <div className="animate-pulse text-center">
          <Camera className="h-24 w-24 text-primary mx-auto mb-4" />
          <p className="font-serif text-3xl text-primary">Set Media</p>
        </div>
      </div>
    )
  }

  if (isExiting) {
    return (
      <div
        id="preloader"
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500",
          className
        )}
        style={{ opacity: 0, pointerEvents: "none" }}
      >
        <div className="animate-pulse text-center">
          <Camera className="h-24 w-24 text-primary mx-auto mb-4" />
          <p className="font-serif text-3xl text-primary">Set Media</p>
        </div>
      </div>
    )
  }

  return null
}