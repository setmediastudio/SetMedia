import { randomBytes, createHmac } from "crypto"

const CSRF_SECRET = process.env.CSRF_SECRET || "default-csrf-secret-change-in-production"

export function generateCSRFToken(): string {
  const timestamp = Date.now().toString()
  const randomValue = randomBytes(16).toString("hex")
  const payload = `${timestamp}.${randomValue}`
  const signature = createHmac("sha256", CSRF_SECRET).update(payload).digest("hex")
  return `${payload}.${signature}`
}

export function verifyCSRFToken(token: string): boolean {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return false

    const [timestamp, randomValue, signature] = parts
    const payload = `${timestamp}.${randomValue}`
    const expectedSignature = createHmac("sha256", CSRF_SECRET).update(payload).digest("hex")

    // Verify signature
    if (signature !== expectedSignature) return false

    // Check if token is not older than 1 hour
    const tokenTime = Number.parseInt(timestamp)
    const currentTime = Date.now()
    const oneHour = 60 * 60 * 1000

    return currentTime - tokenTime < oneHour
  } catch (error) {
    return false
  }
}

export function getCSRFTokenFromHeaders(headers: Headers): string | null {
  return headers.get("x-csrf-token") || headers.get("X-CSRF-Token")
}
