import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyCSRFToken, getCSRFTokenFromHeaders } from "@/lib/csrf"
import { verifyTurnstileToken } from "@/lib/turnstile"
import { getClientIdentifier, authRateLimit, apiRateLimit, strictRateLimit } from "@/lib/rate-limit"

export interface SecurityValidationResult {
  success: boolean
  error?: string
  session?: any
  rateLimitHeaders?: Record<string, string>
}

export async function validateAPIRequest(
  request: NextRequest,
  options: {
    requireAuth?: boolean
    requireAdmin?: boolean
    requireCSRF?: boolean
    requireTurnstile?: boolean
    rateLimit?: "auth" | "api" | "strict" | "none"
  } = {},
): Promise<SecurityValidationResult> {
  const {
    requireAuth = true,
    requireAdmin = false,
    requireCSRF = true,
    requireTurnstile = false,
    rateLimit = "api",
  } = options

  try {
    const clientId = getClientIdentifier(request)
    let rateLimitHeaders: Record<string, string> = {}

    // Apply rate limiting
    if (rateLimit !== "none") {
      let limiter
      switch (rateLimit) {
        case "auth":
          limiter = authRateLimit
          break
        case "strict":
          limiter = strictRateLimit
          break
        default:
          limiter = apiRateLimit
      }

      const rateLimitResult = limiter.check(clientId)

      rateLimitHeaders = {
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": new Date(rateLimitResult.resetTime).toISOString(),
      }

      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          rateLimitHeaders: {
            ...rateLimitHeaders,
            "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      }
    }

    // Check authentication
    if (requireAuth) {
      const session = await getServerSession(authOptions)
      if (!session) {
        return { success: false, error: "Authentication required", rateLimitHeaders }
      }

      // Check admin role if required
      if (requireAdmin && session.user?.role !== "admin") {
        return { success: false, error: "Admin access required", rateLimitHeaders }
      }

      // Validate CSRF token for state-changing operations
      if (requireCSRF && ["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
        const csrfToken = getCSRFTokenFromHeaders(request.headers)
        if (!csrfToken || !verifyCSRFToken(csrfToken)) {
          return { success: false, error: "Invalid CSRF token", rateLimitHeaders }
        }
      }

      // Validate Turnstile token if required
      if (requireTurnstile) {
        const body = await request.json()
        const turnstileToken = body.turnstileToken

        if (!turnstileToken) {
          return { success: false, error: "Turnstile verification required", rateLimitHeaders }
        }

        const turnstileResult = await verifyTurnstileToken(turnstileToken)
        if (!turnstileResult.success) {
          return { success: false, error: "Turnstile verification failed", rateLimitHeaders }
        }
      }

      return { success: true, session, rateLimitHeaders }
    }

    return { success: true, rateLimitHeaders }
  } catch (error) {
    console.error("API security validation error:", error)
    return { success: false, error: "Security validation failed" }
  }
}
