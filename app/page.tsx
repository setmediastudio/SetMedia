"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { PortfolioSection } from "@/components/portfolio-section"
import { BookingSection } from "@/components/booking-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { FloatingCTA } from "@/components/floating-cta"
import { Preloader } from "@/components/preloader"
import { NewsletterPopup } from "@/components/newsletter-popup"
import { ParticlesBackground } from "@/components/particles-background"
import { ChevronUp, ChevronDown, Play } from "lucide-react"
import Image from "next/image"
import { VideoLoader } from "@/components/ui/video-loader"

export default function HomePage() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [showVideoLoader, setShowVideoLoader] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const attemptVideoPlay = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    try {
      // Ensure video is muted (required for autoplay on mobile)
      video.muted = true
      video.playsInline = true

      // Try to play the video
      await video.play()
      setIsVideoPlaying(true)
      setVideoError(false)
    } catch (error) {
      console.warn("[v0] Video autoplay failed, will show fallback:", error)
      setVideoError(true)
      setIsVideoPlaying(false)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlay = () => {
      setVideoLoaded(true)
      // Hide loader after video is ready
      setTimeout(() => setShowVideoLoader(false), 300)
      attemptVideoPlay()
    }

    const handleLoadedData = () => {
      setVideoLoaded(true)
      attemptVideoPlay()
    }

    const handlePlay = () => {
      setIsVideoPlaying(true)
      setVideoError(false)
      setShowVideoLoader(false)
    }

    const handleError = () => {
      console.error("[v0] Video failed to load")
      setVideoError(true)
      setVideoLoaded(true)
      setIsVideoPlaying(false)
      setShowVideoLoader(false)
    }

    const handleStalled = () => {
      // Video stalled, try to resume
      setTimeout(() => attemptVideoPlay(), 1000)
    }

    // Add event listeners
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("loadeddata", handleLoadedData)
    video.addEventListener("play", handlePlay)
    video.addEventListener("error", handleError)
    video.addEventListener("stalled", handleStalled)

    video.load()

    // Also attempt play after a short delay (helps with mobile)
    const playTimeout = setTimeout(() => {
      attemptVideoPlay()
    }, 500)

    // Hide loader after 3 seconds max (failsafe)
    const loaderTimeout = setTimeout(() => {
      setShowVideoLoader(false)
    }, 3000)

    const handleUserInteraction = () => {
      if (!isVideoPlaying && video.paused) {
        attemptVideoPlay()
      }
    }

    document.addEventListener("touchstart", handleUserInteraction, { once: true })
    document.addEventListener("click", handleUserInteraction, { once: true })

    return () => {
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("loadeddata", handleLoadedData)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("error", handleError)
      video.removeEventListener("stalled", handleStalled)
      document.removeEventListener("touchstart", handleUserInteraction)
      document.removeEventListener("click", handleUserInteraction)
      clearTimeout(playTimeout)
      clearTimeout(loaderTimeout)
    }
  }, [attemptVideoPlay, isVideoPlaying])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const scrollToPortfolio = () => {
    document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      <Preloader onComplete={() => setIsLoading(false)} />
      <NewsletterPopup />

      <div
        className={`min-h-screen bg-background transition-opacity duration-500 ${isLoading ? "opacity-0" : "opacity-100"}`}
      >
        <ParticlesBackground />

        <MainNav />

        <section className="relative h-screen w-full overflow-hidden">
          {/* Video Loading Animation */}
          <VideoLoader isLoading={showVideoLoader} />

          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/cinematic-photography-studio-behind-the-scenes.jpg"
            style={{
              transform: `translateY(${scrollY * 0.3}px) scale(${1 + scrollY * 0.0001})`,
            }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              isVideoPlaying && !videoError ? "opacity-100" : "opacity-0"
            }`}
          >
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/files-blob/setMedia1/public/hero_1-9CetslK4HgmM70OBxkvOaWTWij2S0R.webm" type="video/webm" />
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/files-blob/setMedia1/public/hero_1-TADQYrvFa84VSpTkCVRADhHd2xaKQW.mp4" type="video/mp4" />
          </video>

          <Image
            src="/cinematic-photography-studio-behind-the-scenes.jpg"
            alt="Set Media Studio"
            fill
            priority
            className={`absolute inset-0 object-cover transition-opacity duration-1000 ${
              !isVideoPlaying || videoError ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: `translateY(${scrollY * 0.3}px) scale(${1 + scrollY * 0.0001})`,
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />

          <div className="absolute top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse delay-1000" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6 text-center">
            <div className="mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm text-xs sm:text-sm text-primary">
                <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                Cinematic Excellence
              </span>
            </div>

            <h1 className="mb-4 sm:mb-6 font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
              <span className="text-gradient-gold">Set Media</span>
            </h1>

            <p className="mb-3 sm:mb-4 max-w-2xl text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 font-light px-2">
              Capturing Stories Beyond the Frame
            </p>

            <p className="mb-6 sm:mb-10 max-w-sm sm:max-w-xl text-sm sm:text-base md:text-lg text-white/70 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 px-4">
              Transform your precious moments into cinematic masterpieces with our award-winning photography and
              videography services
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 w-full sm:w-auto px-4 sm:px-0">
              <Button
                onClick={scrollToPortfolio}
                size="lg"
                className="gold-glow text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto"
              >
                Explore Our Work
              </Button>
              <Button
                onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })}
                size="lg"
                variant="outline"
                className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm w-full sm:w-auto"
              >
                Book a Session
              </Button>
            </div>

            {/* Scroll indicator moved up to give more breathing room */}
            <div className="absolute bottom-10 sm:bottom-12 animate-bounce">
              <ChevronDown className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </div>
        </section>

        <div className="section-divider" />

        <PortfolioSection />

        <div className="section-divider" />

        <BookingSection />

        <div className="section-divider" />

        <TestimonialsSection />

        <div className="section-divider" />

        <ContactSection />

        <Footer />

        <FloatingCTA />

        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            size="icon"
            className="fixed bottom-6 left-6 z-40 rounded-full gold-glow"
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        )}
      </div>
    </>
  )
}