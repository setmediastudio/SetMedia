export interface TurnstileResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  "error-codes"?: string[]
  action?: string
  cdata?: string
}

export async function verifyTurnstileToken(token: string): Promise<TurnstileResponse> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  if (!secretKey) {
    throw new Error("Turnstile secret key not configured")
  }

  const formData = new FormData()
  formData.append("secret", secretKey)
  formData.append("response", token)

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    })

    const result: TurnstileResponse = await response.json()
    return result
  } catch (error) {
    console.error("Turnstile verification error:", error)
    return { success: false, "error-codes": ["network-error"] }
  }
}

export function getTurnstileSiteKey(): string {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  if (!siteKey) {
    console.warn("Turnstile site key not configured")
    return ""
  }
  return siteKey
}
