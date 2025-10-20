export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from "next/server"
import { validateAPIRequest } from "@/lib/api-security"
import { getSecurityMetrics } from "@/lib/security-monitor"
import { addSecurityHeaders } from "@/lib/security-headers"

export async function GET(request: NextRequest) {
  try {
    const securityResult = await validateAPIRequest(request, {
      requireAuth: true,
      requireAdmin: true,
      requireCSRF: false,
      rateLimit: "api",
    })

    if (!securityResult.success) {
      const response = NextResponse.json({ error: securityResult.error }, { status: 401 })
      return addSecurityHeaders(response)
    }

    const { searchParams } = new URL(request.url)
    const timeRange = (searchParams.get("timeRange") as "hour" | "day" | "week" | "month") || "day"

    const metrics = await getSecurityMetrics(timeRange)

    if (!metrics) {
      const response = NextResponse.json({ error: "Failed to fetch security metrics" }, { status: 500 })
      return addSecurityHeaders(response)
    }

    const response = NextResponse.json(metrics)

    // Add rate limit headers
    if (securityResult.rateLimitHeaders) {
      Object.entries(securityResult.rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
    }

    return addSecurityHeaders(response)
  } catch (error) {
    console.error("Security metrics API error:", error)
    const response = NextResponse.json({ error: "Internal server error" }, { status: 500 })
    return addSecurityHeaders(response)
  }
}
