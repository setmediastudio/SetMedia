/**
 * Image Optimization and Caching Utility
 * Provides functions for optimal image loading, caching, and performance
 */

// Image cache management
const imageCache = new Map<string, boolean>()
const videoCache = new Map<string, boolean>()

/**
 * Prefetch image to cache it
 */
export const prefetchImage = (url: string): void => {
  if (!url || imageCache.has(url)) return

  const img = new Image()
  img.src = url
  imageCache.set(url, true)
}

/**
 * Prefetch video metadata
 */
export const prefetchVideo = (url: string): void => {
  if (!url || videoCache.has(url)) return

  const video = document.createElement("video")
  video.src = url
  video.preload = "metadata"
  videoCache.set(url, true)
}

/**
 * Generate optimized image source for different scenarios
 */
export const getOptimizedImageSrc = (publicUrl: string | undefined, sdUrl: string | undefined): string => {
  // Prefer SD version for landing page (smaller file size)
  return sdUrl || publicUrl || "/placeholder.svg"
}

/**
 * Get image dimensions to prevent layout shift
 */
export const getImageDimensions = (fileType: string): { width: number; height: number } | null => {
  // Return aspect ratio for known types
  if (fileType.startsWith("image/")) {
    // Default square aspect ratio for gallery items
    return { width: 1, height: 1 }
  }
  if (fileType.startsWith("video/")) {
    // Video aspect ratio (16:9 common, but we use square for gallery)
    return { width: 1, height: 1 }
  }
  return null
}

/**
 * Image loading strategy with progressive enhancement
 */
export const loadImageProgressively = (
  url: string,
  onLoadStart?: () => void,
  onLoadComplete?: (success: boolean) => void,
): AbortController => {
  const controller = new AbortController()

  onLoadStart?.()

  const img = new Image()
  
  img.onload = () => {
    onLoadComplete?.(true)
  }

  img.onerror = () => {
    onLoadComplete?.(false)
  }

  img.src = url

  return controller
}

/**
 * Batch prefetch multiple images
 * Use requestIdleCallback for non-blocking prefetch
 */
export const batchPrefetchImages = (urls: string[]): void => {
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(() => {
      urls.forEach((url) => {
        if (url && !imageCache.has(url)) {
          prefetchImage(url)
        }
      })
    })
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      urls.forEach((url) => {
        if (url && !imageCache.has(url)) {
          prefetchImage(url)
        }
      })
    }, 0)
  }
}

/**
 * Clear cache to free memory if needed
 */
export const clearImageCache = (): void => {
  imageCache.clear()
  videoCache.clear()
}

/**
 * Get cache statistics for monitoring
 */
export const getCacheStats = (): { images: number; videos: number } => {
  return {
    images: imageCache.size,
    videos: videoCache.size,
  }
}

/**
 * Debounced image prefetch for visibility changes
 */
export const debounceImagePrefetch = (urls: string[], delay: number = 300): (() => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      batchPrefetchImages(urls)
    }, delay)
  }
}
