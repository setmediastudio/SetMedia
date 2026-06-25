"use client"

import { memo, useEffect, useState } from "react"

const ParticlesBackground = memo(function ParticlesBackground() {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setShouldRender(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  if (!shouldRender) return null

  return (
    <div className="particles-container" aria-hidden="true" style={{ willChange: "transform, opacity" }}>
      <div className="particle particle-1" />
      <div className="particle particle-2" />
      <div className="particle particle-3" />
      <div className="particle particle-4" />
      <div className="particle particle-5" />
      <div className="particle particle-6" />
      <div className="particle particle-7" />
      <div className="particle particle-8" />
      <div className="particle particle-9" />
      <div className="particle particle-10" />
      <div className="particle particle-11" />
      <div className="particle particle-12" />
    </div>
  )
})

export { ParticlesBackground }
