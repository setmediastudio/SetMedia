"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { PortfolioSection } from "@/components/portfolio-section"
import { BookingSection } from "@/components/booking-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { FloatingCTA } from "@/components/floating-cta"
import { Preloader } from "@/components/preloader"
import { ChevronUp, ChevronDown } from "lucide-react"
import { useRef } from "react"

export default function HomePage() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Preload video data first
            video.preload = "auto"

            // Attempt to play the video
            const playPromise = video.play()

            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                console.warn("[v0] Video autoplay failed:", error)
                // Video will still show poster image if autoplay fails
              })
            }

            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 },
    )

    observer.observe(video)

    return () => observer.disconnect()
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const scrollToPortfolio = () => {
    document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })
  }

  const handleVideoLoad = () => {
    setVideoLoaded(true)
    setVideoError(false)
  }

  const handleVideoError = () => {
    console.error("[v0] Video failed to load")
    setVideoError(true)
    setVideoLoaded(true) // Show poster image as fallback
  }

  return (
    <>
      <Preloader onComplete={() => setIsLoading(false)} />

      <div
        className={`min-h-screen bg-background transition-opacity duration-500 ${isLoading ? "opacity-0" : "opacity-100"}`}
      >
        <MainNav />

        {/* Hero Section */}
        <section className="relative h-screen w-full overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/cinematic-photography-studio-behind-the-scenes.jpg"
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            style={{
              transform: `translateY(${scrollY * 0.5}px) scale(${1 + scrollY * 0.0002})`,
            }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <source src="/hero_1.webm" type="video/webm" />
            <source src="/hero_1.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
          <div className="absolute bottom-0 left-0 right-0 h-[75px] bg-gradient-to-t from-black/40 via-black/20 to-transparent z-10" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
            <h1 className="mb-6 font-serif text-6xl font-bold text-white md:text-8xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Set Media
            </h1>
            <p className="mb-8 max-w-2xl text-xl text-white/90 md:text-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              Capturing Stories Beyond the Frame
            </p>
            <Button
              onClick={scrollToPortfolio}
              size="lg"
              className="gold-glow animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 text-lg px-8 py-6"
            >
              Explore Our Work
            </Button>

            <div className="absolute bottom-8 animate-bounce">
              <ChevronDown className="h-8 w-8 text-primary" />
            </div>
          </div>
        </section>

        <PortfolioSection />
        <BookingSection />
        <TestimonialsSection />
        <ContactSection />
        <Footer />

        <FloatingCTA />

        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            size="icon"
            className="fixed bottom-6 left-6 z-40 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 gold-glow"
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        )}
      </div>
    </>
  )
}
