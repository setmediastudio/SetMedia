"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { PortfolioSection } from "@/components/portfolio-section"
import { BookingSection } from "@/components/booking-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { FloatingCTA } from "@/components/floating-cta"
import { NewsletterPopup } from "@/components/newsletter-popup"
import { ParticlesBackground } from "@/components/particles-background"
import { ChevronUp, ChevronDown, Play } from "lucide-react"
import Image from "next/image"

const HERO_VIDEO_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/files-blob/setMedia1/public/hero_1-TADQYrvFa84VSpTkCVRADhHd2xaKQW.mp4"

export default function HomePage() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isLowEndDevice, setIsLowEndDevice] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const cores = navigator.hardwareConcurrency || 4
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4
      const isMobile = /Mobi|Android/i.test(navigator.userAgent)
      setIsLowEndDevice(cores <= 4 || memory <= 4 || isMobile)
    }
    checkDevice()
  }, [])

  const preloadVideo = useCallback(() => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "video"
    link.type = 'video/mp4; codecs="avc1.42E01E"'
    link.href = HERO_VIDEO_URL
    link.crossOrigin = "anonymous"
    document.head.appendChild(link)
  }, [])

  useEffect(() => {
    preloadVideo()

    let ticking = false
    let lastVisible = false

    const handleScroll = () => {
      if (ticking) return

      ticking = true
      window.requestAnimationFrame(() => {
        const nextVisible = window.scrollY > 500
        if (nextVisible !== lastVisible) {
          lastVisible = nextVisible
          setShowScrollTop(nextVisible)
        }
        ticking = false
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [preloadVideo])

  const attemptVideoPlay = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    if (video.readyState < 2) {
      video.load()
      return
    }

    try {
      video.muted = true
      video.playsInline = true
      video.defaultMuted = true

      await video.play()
      setIsVideoPlaying(true)
      setVideoError(false)
    } catch (error: unknown) {
      const err = error as DOMException
      if (err.name === "NotAllowedError" || err.name === "NotSupportedError") {
        console.warn("[v0] Video autoplay blocked, waiting for user interaction:", err.message)
      } else {
        console.warn("[v0] Video autoplay failed:", err)
        setVideoError(true)
        setIsVideoPlaying(false)
      }
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.setAttribute("x-webkit-airplay", "deny")
    video.disablePictureInPicture = true
    video.disableRemotePlayback = true

    let canPlayThroughFired = false
    let hasAttemptedPlay = false

    const attemptPlay = async () => {
      if (hasAttemptedPlay) return
      hasAttemptedPlay = true

      if (video.readyState >= 2) {
        try {
          video.muted = true
          video.defaultMuted = true
          video.playsInline = true
          await video.play()
          setIsVideoPlaying(true)
          setVideoError(false)
        } catch (error: unknown) {
          const err = error as DOMException
          if (err.name === "NotAllowedError" || err.name === "NotSupportedError") {
            console.warn("[v0] Video autoplay blocked, waiting for user interaction:", err.message)
          } else {
            console.warn("[v0] Video autoplay failed:", err)
            setVideoError(true)
            setIsVideoPlaying(false)
          }
        }
      }
    }

    const handleCanPlayThrough = () => {
      if (!canPlayThroughFired) {
        canPlayThroughFired = true
        attemptPlay()
      }
    }

    const handlePlay = () => {
      setIsVideoPlaying(true)
      setVideoError(false)
    }

    const handleError = () => {
      console.error("[v0] Video failed to load")
      setVideoError(true)
      setIsVideoPlaying(false)
    }

    const handleStalled = () => {
      if (video.readyState >= 3) {
        setTimeout(attemptPlay, 500)
      }
    }

    const handleWaiting = () => {
      if (isVideoPlaying) {
        setVideoError(true)
        setIsVideoPlaying(false)
      }
    }

    const handleLoadedData = () => {
      if (!hasAttemptedPlay && video.readyState >= 2) {
        attemptPlay()
      }
    }

    video.addEventListener("canplaythrough", handleCanPlayThrough, { once: true })
    video.addEventListener("loadeddata", handleLoadedData, { once: true })
    video.addEventListener("play", handlePlay)
    video.addEventListener("error", handleError)
    video.addEventListener("stalled", handleStalled)
    video.addEventListener("waiting", handleWaiting)

    const playTimeout = setTimeout(() => {
      if (video.readyState >= 2) {
        attemptPlay()
      }
    }, 1000)

    const handleUserInteraction = () => {
      if (!isVideoPlaying && video.paused && video.readyState >= 2) {
        attemptPlay()
      }
    }

    document.addEventListener("touchstart", handleUserInteraction, { once: true, passive: true })
    document.addEventListener("click", handleUserInteraction, { once: true, passive: true })

    return () => {
      video.removeEventListener("canplaythrough", handleCanPlayThrough)
      video.removeEventListener("loadeddata", handleLoadedData)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("error", handleError)
      video.removeEventListener("stalled", handleStalled)
      video.removeEventListener("waiting", handleWaiting)
      document.removeEventListener("touchstart", handleUserInteraction)
      document.removeEventListener("click", handleUserInteraction)
      clearTimeout(playTimeout)
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
      <NewsletterPopup />

      <div className="min-h-screen bg-background">
        {!isLowEndDevice && <ParticlesBackground />}

        <MainNav />

        <section className="relative h-screen w-full overflow-hidden">
          <div
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 will-change-opacity ${
              isVideoPlaying && !videoError ? "opacity-0" : "opacity-100"
            }`}
            aria-hidden="true"
            style={{ backgroundImage: 'url("/hero-poster.webp")', backgroundSize: "cover", backgroundPosition: "center" }}
          />

          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            poster="/hero-poster.webp"
            disablePictureInPicture
            disableRemotePlayback
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 will-change-opacity gpu-accelerated ${
              isVideoPlaying && !videoError ? "opacity-100" : "opacity-0"
            }`}
          >
            <source src={HERO_VIDEO_URL} type='video/mp4; codecs="avc1.42E01E"' />
          </video>

          <div
            className={`absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90 transition-opacity duration-700 ${
              isVideoPlaying && !videoError ? "opacity-0" : "opacity-100"
            }`}
            aria-hidden="true"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />

          {!isLowEndDevice && (
            <>
              <div className="absolute top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
              <div className="absolute bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse delay-1000" />
            </>
          )}

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

        <section style={{ contentVisibility: "auto", containIntrinsicSize: "0 800px" }}>
          <PortfolioSection />
        </section>

        <div className="section-divider" />

        <section style={{ contentVisibility: "auto", containIntrinsicSize: "0 600px" }}>
          <BookingSection />
        </section>

        <div className="section-divider" />

        <section style={{ contentVisibility: "auto", containIntrinsicSize: "0 600px" }}>
          <TestimonialsSection />
        </section>

        <div className="section-divider" />

        <section style={{ contentVisibility: "auto", containIntrinsicSize: "0 500px" }}>
          <ContactSection />
        </section>

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
