export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { validateAPIRequest } from "@/lib/api-security"
import { validateInput, signUpSchema, sanitizeString, sanitizeEmail } from "@/lib/validation"
import { addSecurityHeaders } from "@/lib/security-headers"

export async function POST(request: NextRequest) {
  try {
    // Validate security requirements
    const securityResult = await validateAPIRequest(request, {
      requireAuth: false,
      requireCSRF: false,
      requireTurnstile: true,
      rateLimit: "auth",
    })

    if (!securityResult.success) {
      const response = NextResponse.json({ error: securityResult.error }, { status: 429 })

      // Add rate limit headers
      if (securityResult.rateLimitHeaders) {
        Object.entries(securityResult.rateLimitHeaders).forEach(([key, value]) => {
          response.headers.set(key, value)
        })
      }

      return addSecurityHeaders(response)
    }

    const body = await request.json()

    // Validate input
    const validation = validateInput(signUpSchema)(body)
    if (!validation.success) {
      const response = NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 },
      )
      return addSecurityHeaders(response)
    }

    const { name, email, password } = validation.data

    // Sanitize inputs
    const sanitizedName = sanitizeString(name)
    const sanitizedEmail = sanitizeEmail(email)

    await dbConnect()

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedEmail })
    if (existingUser) {
      const response = NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
      return addSecurityHeaders(response)
    }

    // Create new user
    const user = await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password,
      provider: "credentials",
      role: "user",
    })

    const response = NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    )

    // Add rate limit headers
    if (securityResult.rateLimitHeaders) {
      Object.entries(securityResult.rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
    }

    return addSecurityHeaders(response)
  } catch (error) {
    console.error("Registration error:", error)
    const response = NextResponse.json({ error: "Internal server error" }, { status: 500 })
    return addSecurityHeaders(response)
  }
}
