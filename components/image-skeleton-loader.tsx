"use client"

import { useState, useEffect } from "react"

interface ImageSkeletonLoaderProps {
  src: string
  alt: string
  className?: string
  onImageLoaded?: () => void
  onImageError?: () => void
  fallbackSrc?: string
  aspectRatio?: "square" | "video" | "auto"
}

export function ImageSkeletonLoader({
  src,
  alt,
  className = "w-full h-full",
  onImageLoaded,
  onImageError,
  fallbackSrc = "/placeholder.svg",
  aspectRatio = "auto",
}: ImageSkeletonLoaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger visibility animation
    const timer = setTimeout(() => setIsVisible(true), 0)
    return () => clearTimeout(timer)
  }, [])

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
    onImageLoaded?.()
  }

  const handleImageError = () => {
    if (imageSrc !== fallbackSrc) {
      // Try fallback source
      setImageSrc(fallbackSrc)
    } else {
      // Both sources failed
      setHasError(true)
      setIsLoading(false)
      onImageError?.()
    }
  }

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  }[aspectRatio]

  const skeletonStyle = {
    animation: isLoading ? "skeleton-shimmer 2s infinite" : "none",
  }

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-muted ${aspectRatioClass} ${className}`}
      >
        <div className="text-center">
          <div className="h-8 w-8 rounded-full bg-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Failed to load image</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden ${aspectRatioClass} ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 200ms ease-in-out",
      }}
    >
      {/* Skeleton loader */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted"
          style={skeletonStyle}
        />
      )}

      {/* Actual image */}
      <img
        src={imageSrc || "/placeholder.svg"}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        decoding="async"
      />

      <style jsx>{`
        @keyframes skeleton-shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
      `}</style>
    </div>
  )
}
