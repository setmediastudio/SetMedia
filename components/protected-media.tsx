"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProtectedMediaProps {
  src: string
  alt: string
  type: "image" | "video"
  className?: string
  width?: number
  height?: number
  onLoad?: () => void
}

export function ProtectedMedia({ src, alt, type, className, width, height, onLoad }: ProtectedMediaProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const mediaStyles = {
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
    userSelect: "none",
    WebkitUserDrag: "none",
    KhtmlUserDrag: "none",
    MozUserDrag: "none",
    OUserDrag: "none",
    pointerEvents: "none" as const,
  }

  if (type === "video") {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <video
          src={src}
          className="w-full h-full object-cover"
          style={mediaStyles}
          onLoadedData={handleLoad}
          muted
          loop
          playsInline
          controlsList="nodownload"
          disablePictureInPicture
        />
        <div className="absolute inset-0 pointer-events-none" />
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {width && height ? (
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-full object-cover"
          style={mediaStyles}
          onLoad={handleLoad}
          draggable={false}
        />
      ) : (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className="w-full h-full object-cover"
          style={mediaStyles}
          onLoad={handleLoad}
          draggable={false}
        />
      )}
      <div className="absolute inset-0 pointer-events-none" />
    </div>
  )
}
