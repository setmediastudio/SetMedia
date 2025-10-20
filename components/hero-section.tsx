"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.load()
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 },
    )

    observer.observe(video)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleVideoLoad = () => {
    setVideoLoaded(true)
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        poster="/cinematic-photography-studio-behind-the-scenes.jpg"
        onLoadedData={handleVideoLoad}
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

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

      <div className="absolute bottom-0 left-0 right-0 h-[75px] bg-gradient-to-t from-black/40 via-black/20 to-transparent z-10" />

      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-2xl font-bold text-white">
          Set Media
        </Link>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="text-white hover:text-primary hover:bg-white/10">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button asChild className="gold-glow">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-6 font-serif text-6xl font-bold text-white md:text-8xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Set Media
        </h1>
        <p className="mb-8 max-w-2xl text-xl text-white/90 md:text-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          Capturing Stories Beyond the Frame
        </p>
        <Button
          onClick={scrollToBooking}
          size="lg"
          className="gold-glow animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 text-lg px-8 py-6"
        >
          Book a Session
        </Button>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 animate-bounce">
          <ChevronDown className="h-8 w-8 text-primary" />
        </div>
      </div>
    </section>
  )
}
