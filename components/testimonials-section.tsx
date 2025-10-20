"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const testimonials = [
  {
    id: 1,
    name: "Sarah & Michael",
    role: "Wedding Clients",
    image: "/happy-couple-portrait.png",
    quote:
      "Set Media captured our wedding day in the most beautiful, cinematic way. Every photo tells a story, and we couldn't be happier with the results.",
  },
  {
    id: 2,
    name: "David Chen",
    role: "Corporate Event",
    image: "/professional-businessman-portrait.png",
    quote:
      "Professional, creative, and incredibly talented. They transformed our corporate event into a visual masterpiece. Highly recommended!",
  },
  {
    id: 3,
    name: "Amara Johnson",
    role: "Fashion Portfolio",
    image: "/fashion-model-headshot.jpg",
    quote:
      "Working with Set Media was an absolute dream. Their attention to detail and artistic vision brought my portfolio to life in ways I never imagined.",
  },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(timer)
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
      { threshold: 0.3 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  return (
    <section ref={sectionRef} className="relative py-24 px-4 bg-gradient-to-b from-card to-black overflow-x-hidden">
      <div className="container mx-auto max-w-4xl">
        <div
          className="mb-12 text-center transition-all duration-1000"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateX(0) rotate(0deg)" : "translateX(-50px) rotate(-2deg)",
          }}
        >
          <h2 className="mb-4 font-serif text-5xl font-bold text-balance">Stories From Our Clients</h2>
          <p className="text-xl text-muted-foreground">Every shoot leaves a story worth telling.</p>
        </div>

        <div
          className="relative transition-all duration-1000 delay-300"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateX(0) rotate(0deg)" : "translateX(50px) rotate(2deg)",
          }}
        >
          <Card className="border-border bg-card/50 backdrop-blur">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col items-center text-center">
                <Image
                  src={testimonials[currentIndex].image || "/placeholder.svg"}
                  alt={testimonials[currentIndex].name}
                  width={100}
                  height={100}
                  className="mb-6 rounded-full"
                />
                <p className="mb-6 text-lg italic leading-relaxed md:text-xl">"{testimonials[currentIndex].quote}"</p>
                <p className="font-semibold text-lg">{testimonials[currentIndex].name}</p>
                <p className="text-muted-foreground">{testimonials[currentIndex].role}</p>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="outline" size="icon" onClick={goToPrevious} className="rounded-full bg-transparent">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext} className="rounded-full bg-transparent">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Indicators */}
          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentIndex ? "w-8 bg-primary" : "bg-muted"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
