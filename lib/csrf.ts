import { randomBytes, createHmac } from "crypto"

const CSRF_SECRET = process.env.CSRF_SECRET
if (!CSRF_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("CSRF_SECRET environment variable must be set in production")
}

const CSRF_SECRET_VALUE = CSRF_SECRET || "default-csrf-secret-change-in-production"

export function generateCSRFToken(): string {
  const timestamp = Date.now().toString()
  const randomValue = randomBytes(16).toString("hex")
  const payload = `${timestamp}.${randomValue}`
  const signature = createHmac("sha256", CSRF_SECRET_VALUE).update(payload).digest("hex")
  return `${payload}.${signature}`
}

export function verifyCSRFToken(token: string): boolean {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return false

    const [timestamp, randomValue, signature] = parts
    const payload = `${timestamp}.${randomValue}`
    const expectedSignature = createHmac("sha256", CSRF_SECRET_VALUE).update(payload).digest("hex")

    // Verify signature using constant-time comparison to prevent timing attacks
    if (!constantTimeCompare(signature, expectedSignature)) return false

    // Check if token is not older than 1 hour
    const tokenTime = Number.parseInt(timestamp)
    const currentTime = Date.now()
    const oneHour = 60 * 60 * 1000

    return currentTime - tokenTime < oneHour
  } catch (error) {
    return false
  }
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export function getCSRFTokenFromHeaders(headers: Headers): string | null {
  return headers.get("x-csrf-token") || headers.get("X-CSRF-Token")
}
