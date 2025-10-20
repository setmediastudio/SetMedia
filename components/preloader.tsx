"use client"

import { useEffect, useState } from "react"
import { Camera } from "lucide-react"

interface PreloaderProps {
  onComplete: () => void
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 500)
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="animate-pulse text-center">
        <Camera className="h-24 w-24 text-primary mx-auto mb-4" />
        <p className="font-serif text-3xl text-primary">Set Media</p>
      </div>
    </div>
  )
}
