"use client"

import { useEffect, useState } from "react"

export function VideoLoader({ isLoading }: { isLoading: boolean }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      // Add a small delay before hiding for smooth transition
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (!isVisible) return null

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-500">
      <div className="relative">
        {/* Main loader */}
        <div className="relative w-16 h-16">
          {/* Outer ring */}
          <div 
            className="absolute inset-0 rounded-full border-4 border-transparent"
            style={{
              borderTopColor: "rgba(212, 165, 94, 0.2)",
              borderRightColor: "transparent",
              borderBottomColor: "transparent",
              borderLeftColor: "transparent",
              animation: "spin 1s linear infinite"
            }}
          />
          
          {/* Middle ring */}
          <div 
            className="absolute inset-2 rounded-full border-4 border-transparent"
            style={{
              borderTopColor: "rgba(212, 165, 94, 0.8)",
              borderRightColor: "transparent",
              borderBottomColor: "transparent",
              borderLeftColor: "transparent",
              animation: "spin 0.5s linear infinite reverse"
            }}
          />
          
          {/* Inner ring */}
          <div 
            className="absolute inset-4 rounded-full border-4 border-transparent"
            style={{
              borderTopColor: "rgba(212, 165, 94, 0.4)",
              borderRightColor: "transparent",
              borderBottomColor: "transparent",
              borderLeftColor: "transparent",
              animation: "spin 2s linear infinite"
            }}
          />
        </div>
        
        {/* Loading text */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <p className="text-sm text-white/70 animate-pulse">Loading cinematic experience...</p>
        </div>

        {/* Add keyframes for spin animation */}
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}