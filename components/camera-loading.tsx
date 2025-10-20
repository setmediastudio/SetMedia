"use client"

import { Camera } from "lucide-react"

export function CameraLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-center">
        <Camera className="h-24 w-24 text-primary mx-auto mb-4" />
        <p className="font-serif text-3xl text-primary">Set Media</p>
      </div>
    </div>
  )
}
