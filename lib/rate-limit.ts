interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  },
  5 * 60 * 1000,
)

export function createRateLimit(config: RateLimitConfig) {
  return {
    check: (identifier: string): { allowed: boolean; remaining: number; resetTime: number } => {
      const now = Date.now()
      const key = `${identifier}`

      let entry = rateLimitStore.get(key)

      // Create new entry or reset if window expired
      if (!entry || entry.resetTime < now) {
        entry = {
          count: 0,
          resetTime: now + config.windowMs,
          blocked: false,
        }
      }

      // Check if request is allowed
      if (entry.count >= config.maxRequests) {
        entry.blocked = true
        rateLimitStore.set(key, entry)
        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.resetTime,
        }
      }

      // Increment counter
      entry.count++
      entry.blocked = false
      rateLimitStore.set(key, entry)

      return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime,
      }
    },

    reset: (identifier: string): void => {
      rateLimitStore.delete(identifier)
    },
  }
}

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes - stricter for security
})

export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
})

export const strictRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute for sensitive operations
})

export const registrationRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 registration attempts per hour per IP
})

export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 password reset attempts per hour
})

export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for production with reverse proxy)
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const cfConnectingIp = request.headers.get("cf-connecting-ip")

  const ip = cfConnectingIp || realIp || forwardedFor?.split(",")[0] || "unknown"

  return ip.trim()
}
