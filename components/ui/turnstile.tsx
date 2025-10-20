"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { getTurnstileSiteKey } from "@/lib/turnstile"

interface TurnstileProps {
  onVerify: (token: string) => void
  onError?: (error: string) => void
  onExpire?: () => void
  theme?: "light" | "dark" | "auto"
  size?: "normal" | "compact"
  className?: string
}

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: any) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

export function Turnstile({
  onVerify,
  onError,
  onExpire,
  theme = "auto",
  size = "normal",
  className = "",
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const isMountedRef = useRef(true)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState(false)

  const siteKey = getTurnstileSiteKey()

  const handleVerify = useCallback(
    (token: string) => {
      if (isMountedRef.current) {
        onVerify(token)
      }
    },
    [onVerify],
  )

  const handleError = useCallback(
    (error: string) => {
      if (isMountedRef.current) {
        setError(error)
        onError?.(error)
        if (widgetIdRef.current && window.turnstile) {
          setTimeout(() => {
            if (widgetIdRef.current && window.turnstile && isMountedRef.current) {
              window.turnstile.reset(widgetIdRef.current)
              setError(null)
            }
          }, 1500)
        }
      }
    },
    [onError],
  )

  const handleExpire = useCallback(() => {
    if (isMountedRef.current) {
      onExpire?.()
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current)
      }
    }
  }, [onExpire])

  useEffect(() => {
    if (!siteKey) {
      setError("Turnstile not configured")
      return
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="turnstile"]')
    if (existingScript) {
      setIsScriptLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    script.async = true
    script.defer = true
    script.onload = () => {
      if (isMountedRef.current) {
        setIsScriptLoaded(true)
      }
    }
    script.onerror = () => {
      if (isMountedRef.current) {
        setError("Failed to load Turnstile")
      }
    }

    document.head.appendChild(script)
  }, [siteKey])

  useEffect(() => {
    if (
      !isScriptLoaded ||
      !containerRef.current ||
      !window.turnstile ||
      !siteKey ||
      widgetIdRef.current ||
      isRendering
    ) {
      return
    }

    setIsRendering(true)

    try {
      // Clear container
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }

      // Render widget
      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        size,
        callback: handleVerify,
        "error-callback": handleError,
        "expired-callback": handleExpire,
      })

      widgetIdRef.current = widgetId
    } catch (err) {
      console.error("[v0] Turnstile render error:", err)
      setError("Failed to render Turnstile widget")
    } finally {
      setIsRendering(false)
    }
  }, [isScriptLoaded, siteKey, theme, size, handleVerify, handleError, handleExpire, isRendering])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (err) {
          console.warn("[v0] Failed to remove Turnstile widget:", err)
        }
      }
    }
  }, [])

  if (!siteKey) {
    return null
  }

  if (error) {
    return <div className={`text-sm text-red-600 ${className}`}>Security verification unavailable</div>
  }

  return <div ref={containerRef} className={className} />
}
