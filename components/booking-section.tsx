"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuthModal } from "@/lib/auth-modal-context"
import { Calendar, Clock, Sparkles, CheckCircle2 } from "lucide-react"

export function BookingSection() {
  const { data: session, status } = useSession()
  const { openSignIn } = useAuthModal()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const today = new Date()
  const minDate = today.toISOString().split("T")[0]

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        const scrollProgress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / window.innerHeight))
        setScrollY(scrollProgress * 100)
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!session?.user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to submit a booking request.",
        variant: "destructive",
      })
      openSignIn()
      return
    }

    const formData = new FormData(e.currentTarget)
    const selectedDate = formData.get("date") as string
    const selectedDateObj = new Date(selectedDate)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    if (selectedDateObj < todayStart) {
      toast({
        title: "Invalid date",
        description: "Please select a future date for your booking.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  const resetForm = () => {
    setIsSubmitted(false)
  }

  return (
    <section ref={sectionRef} id="booking" className="relative py-16 sm:py-24 px-4 bg-transparent overflow-hidden">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/portrait.jpg")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Text */}
          <div
            className="flex flex-col justify-center transition-all duration-1000"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateX(0)" : "translateX(-50px)",
            }}
          >
            <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm text-xs sm:text-sm text-primary w-fit">
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Limited Availability
            </div>

            <h2 className="mb-3 sm:mb-4 font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance text-white">
              Book Your <span className="text-gradient-gold">Cinematic</span> Photo Experience
            </h2>
            <p className="mb-4 sm:mb-6 text-base sm:text-xl text-gray-200">
              Reserve your spot — limited sessions available monthly.
            </p>
            <p className="text-sm sm:text-lg leading-relaxed text-gray-300 mb-6 sm:mb-8">
              Transform moments into timeless stories with Set Media. Fill out the form and let's craft your cinematic
              experience.
            </p>

            <div className="space-y-2 sm:space-y-3">
              {[
                "Professional cinematic equipment",
                "Flexible scheduling options",
                "Quick turnaround delivery",
                "Satisfaction guaranteed",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Form with enhanced glassmorphism */}
          <div
            className="transition-all duration-1000 delay-200"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateX(0)" : "translateX(50px)",
            }}
          >
            {!isSubmitted ? (
              <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-5 sm:p-8 shadow-2xl">
                <div className="mb-5 sm:mb-6 text-center">
                  <div className="mx-auto mb-2 sm:mb-3 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Request a Session</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Fill in your details and we'll get back to you
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div>
                    <Label htmlFor="fullName" className="text-white text-xs sm:text-sm">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      required
                      placeholder="John Doe"
                      className="mt-1.5 sm:mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white text-xs sm:text-sm">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="john@example.com"
                      className="mt-1.5 sm:mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-white text-xs sm:text-sm">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="+234 800 000 0000"
                      className="mt-1.5 sm:mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="shootType" className="text-white text-xs sm:text-sm">
                      Type of Shoot *
                    </Label>
                    <Select name="shootType" required>
                      <SelectTrigger className="mt-1.5 sm:mt-2 bg-white/5 border-white/10 text-white h-10 sm:h-11 text-sm sm:text-base">
                        <SelectValue placeholder="Select shoot type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10">
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date" className="text-white text-xs sm:text-sm flex items-center gap-2">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      Preferred Date *
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      required
                      min={minDate}
                      className="mt-1.5 sm:mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 [color-scheme:dark] text-sm sm:text-base h-10 sm:h-11"
                    />
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Select a future date for your session</p>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-white text-xs sm:text-sm">
                      Additional Details
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={3}
                      placeholder="Tell us about your vision..."
                      className="mt-1.5 sm:mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 resize-none text-sm sm:text-base"
                    />
                  </div>

                  {!session?.user && (
                    <div className="p-2.5 sm:p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-xs sm:text-sm text-primary text-center">
                        You'll need to sign in to submit your booking request
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 sm:h-12 gold-glow text-sm sm:text-base"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </div>
                    ) : session?.user ? (
                      "Submit Request"
                    ) : (
                      "Sign In to Submit"
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-primary/20 bg-black/40 backdrop-blur-xl p-5 sm:p-8 shadow-2xl text-center">
                <div className="mb-4 sm:mb-6 mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
                  <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2 sm:mb-3">Request Received!</h3>
                <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
                  Thank you for your booking request. Our team will review your details and contact you within 24-48
                  hours to confirm your session.
                </p>
                <div className="space-y-2 sm:space-y-3 text-left mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    <span>Confirmation email sent</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    <span>Our team will contact you shortly</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    <span>Custom quote will be provided</span>
                  </div>
                </div>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 text-sm sm:text-base"
                >
                  Submit Another Request
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
