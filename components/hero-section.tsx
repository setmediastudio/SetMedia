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

    const playVideo = () => {
      video.play().catch((error) => {
        console.log("Video autoplay failed:", error)
      })
    }

    playVideo()
    video.addEventListener("loadedmetadata", playVideo)
    video.addEventListener("canplay", playVideo)

    return () => {
      video.removeEventListener("loadedmetadata", playVideo)
      video.removeEventListener("canplay", playVideo)
    }
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
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/cinematic-photography-studio-behind-the-scenes.jpg"
        onLoadedData={handleVideoLoad}
        onCanPlay={handleVideoLoad}
        style={{
          transform: `translateY(${scrollY * 0.5}px) scale(${1 + scrollY * 0.0002})`,
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          videoLoaded ? "opacity-100" : "opacity-50"
        }`}
      >
        <source src="/images/files-blob-setmedia1-public-hero-1.webm" type="video/webm" />
        <source src="/images/files-blob-setmedia1-public-hero-1.mp4" type="video/mp4" />
      </video>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 h-[75px] bg-gradient-to-t from-black/40 via-black/20 to-transparent z-10" />

      {/* Navigation */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 py-4">
        <Link href="/" className="font-serif text-xl sm:text-2xl font-bold text-white flex-shrink-0">
          Set Media
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild variant="ghost" className="text-white hover:text-primary hover:bg-white/10 text-xs sm:text-sm h-9 sm:h-10">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button asChild className="gold-glow text-xs sm:text-sm h-9 sm:h-10">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 text-center">
        <div className="w-full max-w-4xl space-y-4 sm:space-y-6 md:space-y-8">
          <h1 className="font-serif text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white animate-in fade-in slide-in-from-bottom-4 duration-1000 leading-tight tracking-tight">
            Set Media
          </h1>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 leading-relaxed font-medium">
            Capturing Stories Beyond the Frame
          </p>
          <p className="text-xs xs:text-sm sm:text-base md:text-lg text-white/75 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 leading-relaxed max-w-2xl mx-auto px-4">
            Transform your precious moments into cinematic masterpieces with our award-winning photography and videography services
          </p>
          
          {/* Buttons Container */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4 md:pt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <Button
              onClick={scrollToBooking}
              className="gold-glow text-xs xs:text-sm sm:text-base px-5 xs:px-6 sm:px-8 py-4 xs:py-5 sm:py-6 h-auto font-semibold w-full sm:w-auto min-w-[180px]"
            >
              Book a Session
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white text-xs xs:text-sm sm:text-base px-5 xs:px-6 sm:px-8 py-4 xs:py-5 sm:py-6 h-auto font-semibold w-full sm:w-auto min-w-[180px]"
            >
              <Link href="/work">
                Explore Our Work
              </Link>
            </Button>
          </div>
        </div>

        {/* Scroll Indicator - with more spacing */}
        <div className="absolute bottom-8 sm:bottom-10 md:bottom-12 animate-bounce">
          <ChevronDown className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary" />
        </div>
      </div>
    </section>
  )
}