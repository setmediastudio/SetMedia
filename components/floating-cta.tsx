"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export function FloatingCTA() {
  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <Button
      onClick={scrollToBooking}
      size="lg"
      className="fixed bottom-6 right-6 z-40 rounded-full gold-glow shadow-lg"
      aria-label="Book now"
    >
      <Calendar className="mr-2 h-5 w-5" />
      Book Now
    </Button>
  )
}
