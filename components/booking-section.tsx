"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function BookingSection() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        const scrollProgress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / window.innerHeight))
        setScrollY(scrollProgress * 100)
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial call
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Request Received!",
      description: "Thank you! Your session request has been received. We'll contact you shortly.",
    })

    setIsSubmitting(false)
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <section ref={sectionRef} id="booking" className="relative py-24 px-4 bg-transparent overflow-hidden">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/portrait.jpg")',
          }}
        />
        {/* Single lighter overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Text */}
          <div className="flex flex-col justify-center">
            <h2 className="mb-4 font-serif text-5xl font-bold text-balance text-white">
              Book Your Cinematic Photo Experience
            </h2>
            <p className="mb-6 text-xl text-gray-200">Reserve your spot — limited sessions available monthly.</p>
            <p className="text-lg leading-relaxed text-gray-300">
              Transform moments into timeless stories with Set Media. Fill out the form and let's craft your cinematic
              experience.
            </p>
          </div>

          {/* Right Column - Form with glassmorphism */}
          <div className="rounded-lg border border-white/20 bg-black/30 backdrop-blur-md p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="fullName" className="text-white">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  required
                  className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-white">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-white">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="shootType" className="text-white">
                  Type of Shoot *
                </Label>
                <Select name="shootType" required>
                  <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select shoot type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date" className="text-white">
                  Preferred Date *
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-white">
                  Additional Details
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <Button type="submit" className="w-full gold-glow" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
