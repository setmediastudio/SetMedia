// Image caching strategy for portfolio images
// Uses Service Worker and Cache API for offline support and faster loading

interface ImageCache {
  url: string
  timestamp: number
  size: number
}

const CACHE_NAME = "portfolio-images-v1"
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days
const MAX_CACHE_SIZE = 500 * 1024 * 1024 // 500 MB

// Track cached images in memory
let imageCache: Map<string, ImageCache> = new Map()

export async function precacheImages(urls: string[]): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return // Not available in non-browser environments
  }

  try {
    const cache = await caches.open(CACHE_NAME)
    for (const url of urls) {
      if (!imageCache.has(url)) {
        try {
          await cache.add(url)
        } catch (error) {
          console.warn(`[v0] Failed to precache image: ${url}`, error)
        }
      }
    }
  } catch (error) {
    console.warn("[v0] Failed to open cache", error)
  }
}

export async function getImageFromCache(url: string): Promise<Response | undefined> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return undefined
  }

  try {
    const cache = await caches.open(CACHE_NAME)
    const response = await cache.match(url)

    if (response) {
      // Check if cached content is still fresh
      const cachedAt = response.headers.get("x-cached-at")
      if (cachedAt) {
        const age = Date.now() - parseInt(cachedAt, 10)
        if (age > CACHE_DURATION) {
          // Cache expired, delete it
          await cache.delete(url)
          return undefined
        }
      }
      return response.clone()
    }
  } catch (error) {
    console.warn("[v0] Cache retrieval error:", error)
  }

  return undefined
}

export async function cacheImage(url: string, response: Response): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return
  }

  try {
    const cache = await caches.open(CACHE_NAME)
    const clonedResponse = response.clone()

    // Add timestamp header
    const newResponse = new Response(clonedResponse.body, {
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
      headers: new Headers(clonedResponse.headers),
    })
    newResponse.headers.set("x-cached-at", Date.now().toString())

    await cache.put(url, newResponse)

    // Track in memory
    imageCache.set(url, {
      url,
      timestamp: Date.now(),
      size: parseInt(newResponse.headers.get("content-length") || "0", 10),
    })

    // Cleanup if cache gets too large
    await cleanupCache()
  } catch (error) {
    console.warn("[v0] Failed to cache image:", error)
  }
}

export async function cleanupCache(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return
  }

  try {
    const cache = await caches.open(CACHE_NAME)
    const keys = await cache.keys()

    // Calculate total cache size
    let totalSize = 0
    for (const request of keys) {
      const response = await cache.match(request)
      if (response) {
        totalSize += parseInt(response.headers.get("content-length") || "0", 10)
      }
    }

    // If cache exceeds max size, remove oldest entries
    if (totalSize > MAX_CACHE_SIZE) {
      const entries = Array.from(imageCache.values())
        .sort((a, b) => a.timestamp - b.timestamp)

      for (const entry of entries) {
        if (totalSize <= MAX_CACHE_SIZE) break
        await cache.delete(entry.url)
        imageCache.delete(entry.url)
        totalSize -= entry.size
      }
    }
  } catch (error) {
    console.warn("[v0] Cache cleanup error:", error)
  }
}

export async function clearImageCache(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return
  }

  try {
    await caches.delete(CACHE_NAME)
    imageCache.clear()
  } catch (error) {
    console.warn("[v0] Failed to clear cache:", error)
  }
}
