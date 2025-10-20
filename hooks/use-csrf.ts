"use client"

import { useState, useEffect } from "react"

export function useCSRF() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/csrf")

        if (!response.ok) {
          throw new Error("Failed to fetch CSRF token")
        }

        const data = await response.json()
        setCSRFToken(data.csrfToken)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        setCSRFToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCSRFToken()
  }, [])

  const refreshToken = async () => {
    await fetchCSRFToken()
  }

  return { csrfToken, isLoading, error, refreshToken }
}

async function fetchCSRFToken() {
  const response = await fetch("/api/csrf")
  if (!response.ok) {
    throw new Error("Failed to fetch CSRF token")
  }
  const data = await response.json()
  return data.csrfToken
}
