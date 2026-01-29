/**
 * Cache Header Configuration
 * Optimizes caching strategy for different asset types
 */

export const cacheConfig = {
  // Portfolio images and videos - cache for 1 hour on CDN, revalidate every 6 hours
  portfolio: {
    "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=21600",
    "CDN-Cache-Control": "max-age=3600",
  },

  // API responses - cache for 5 minutes
  api: {
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
    "CDN-Cache-Control": "max-age=300",
  },

  // Static assets - cache for 1 year
  static: {
    "Cache-Control": "public, max-age=31536000, immutable",
  },

  // HTML pages - cache for 1 hour
  html: {
    "Cache-Control": "public, max-age=3600, s-maxage=3600, must-revalidate",
  },

  // No cache for dynamic content
  noCache: {
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  },
}

/**
 * Add cache headers to response
 */
export const addCacheHeaders = (
  response: Response,
  cacheType: keyof typeof cacheConfig,
): Response => {
  const headers = cacheConfig[cacheType]

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

/**
 * Generate ETag for cache validation
 */
export const generateETag = (content: string): string => {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `"${hash.toString(36)}"`
}
