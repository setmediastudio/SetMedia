"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const testimonials = [
  {
    id: 1,
    name: "Sarah & Michael",
    role: "Wedding Clients",
    image: "/icons/_IMG_9852.jpg",
    quote:
      "Set Media captured our wedding day in the most beautiful, cinematic way. Every photo tells a story, and we couldn't be happier with the results.",
    rating: 5,
  },
  {
    id: 2,
    name: "David Chen",
    role: "Corporate Event",
    image: "/icons/_IMG_9832.png",
    quote:
      "Professional, creative, and incredibly talented. They transformed our corporate event into a visual masterpiece. Highly recommended!",
    rating: 5,
  },
  {
    id: 3,
    name: "Amara Johnson",
    role: "Fashion Portfolio",
    image: "/icons/_IMG_9168.jpg",
    quote:
      "Working with Set Media was an absolute dream. Their attention to detail and artistic vision brought my portfolio to life in ways I never imagined.",
    rating: 5,
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
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-24 px-4 bg-gradient-to-b from-background via-muted/10 to-background overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] bg-primary/5 rounded-full blur-[200px]" />

      <div className="container mx-auto max-w-5xl relative z-10">
        <div
          className="mb-10 sm:mb-16 text-center transition-all duration-1000"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary/30 bg-primary/10 text-xs sm:text-sm text-primary">
            <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-primary" />
            Client Stories
          </div>
          <h2 className="mb-3 sm:mb-4 font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance px-2">
            Stories From Our <span className="text-gradient-gold">Clients</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Every shoot leaves a story worth telling.
          </p>
        </div>

        <div
          className="relative transition-all duration-1000 delay-300"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <Card className="border-primary/10 glass-card overflow-hidden">
            <CardContent className="p-5 sm:p-8 md:p-12">
              <Quote className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary/30 mb-4 sm:mb-6 mx-auto" />

              <div className="flex flex-col items-center text-center">
                <div className="flex gap-0.5 sm:gap-1 mb-4 sm:mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-primary text-primary" />
                  ))}
                </div>

                <p className="mb-6 sm:mb-8 text-base sm:text-lg md:text-xl leading-relaxed text-foreground/90 max-w-3xl px-2">
                  "{testimonials[currentIndex].quote}"
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <Image
                      src={testimonials[currentIndex].image || "/placeholder.svg"}
                      alt={testimonials[currentIndex].name}
                      width={80}
                      height={80}
                      className="rounded-full border-2 border-primary/20 w-16 h-16 sm:w-20 sm:h-20"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center">
                      <Quote className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-semibold text-base sm:text-lg">{testimonials[currentIndex].name}</p>
                    <p className="text-muted-foreground text-sm">{testimonials[currentIndex].role}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 sm:mt-8 flex justify-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="rounded-full bg-transparent hover:bg-primary/10 hover:border-primary/30 h-10 w-10 sm:h-11 sm:w-11"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full bg-transparent hover:bg-primary/10 hover:border-primary/30 h-10 w-10 sm:h-11 sm:w-11"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-4 sm:mt-6 flex justify-center gap-2 sm:gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 sm:h-2 rounded-full transition-all min-w-[10px] ${
                  index === currentIndex ? "w-8 bg-primary" : "w-2.5 sm:w-2 bg-muted hover:bg-primary/50"
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
