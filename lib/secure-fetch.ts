"use client"

interface SecureFetchOptions extends RequestInit {
  includeTurnstile?: boolean
}

export async function secureFetch(url: string, options: SecureFetchOptions = {}): Promise<Response> {
  const { includeTurnstile = false, ...fetchOptions } = options

  // Get CSRF token
  const csrfResponse = await fetch("/api/csrf")
  if (!csrfResponse.ok) {
    throw new Error("Failed to get CSRF token")
  }
  const { csrfToken } = await csrfResponse.json()

  // Prepare headers
  const headers = new Headers(fetchOptions.headers)
  headers.set("X-CSRF-Token", csrfToken)
  headers.set("Content-Type", "application/json")

  // Add Turnstile token if required
  if (includeTurnstile && fetchOptions.body) {
    const body = JSON.parse(fetchOptions.body as string)
    // Note: Turnstile token should be added by the calling component
    fetchOptions.body = JSON.stringify(body)
  }

  return fetch(url, {
    ...fetchOptions,
    headers,
  })
}
