export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateCSRFToken } from "@/lib/csrf"
import { addSecurityHeaders } from "@/lib/security-headers"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      return addSecurityHeaders(response)
    }

    const csrfToken = generateCSRFToken()

    const response = NextResponse.json({ csrfToken })
    return addSecurityHeaders(response)
  } catch (error) {
    console.error("CSRF token generation error:", error)
    const response = NextResponse.json({ error: "Internal server error" }, { status: 500 })
    return addSecurityHeaders(response)
  }
}
