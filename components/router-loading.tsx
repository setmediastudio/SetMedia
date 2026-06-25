"use client"

import { useEffect, useState, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Camera } from "lucide-react"
import { cn } from "@/lib/utils"

function RouterLoadingInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const handleStart = () => {
      if (mounted) {
        timeoutId = setTimeout(() => setIsLoading(true), 100)
      }
    }

    const handleComplete = () => {
      if (mounted) {
        clearTimeout(timeoutId)
        setIsLoading(false)
      }
    }

    handleStart()

    const timer = setTimeout(handleComplete, 300)

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      clearTimeout(timer)
    }
  }, [pathname, searchParams])

  if (!isLoading) return null

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-primary via-primary/50 to-primary animate-loading-bar",
        "pointer-events-none"
      )}
      role="progressbar"
      aria-label="Page loading"
    />
  )
}

export function RouterLoading() {
  return (
    <Suspense fallback={null}>
      <RouterLoadingInner />
    </Suspense>
  )
}