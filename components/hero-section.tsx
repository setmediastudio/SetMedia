"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [showLoader, setShowLoader] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [videoError, setVideoError] = useState(false)

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })
  }

  const handleVideoLoad = () => {
    setVideoLoaded(true)
    // Hide loader after video is ready with smooth transition
    setTimeout(() => setShowLoader(false), 500)
  }

  const handleVideoError = () => {
    console.error("Video failed to load")
    setVideoError(true)
    // Hide loader immediately on error to show content
    setTimeout(() => setShowLoader(false), 300)
  }

  const handleVideoCanPlay = () => {
    setVideoLoaded(true)
    // Hide loader after video is ready with smooth transition
    setTimeout(() => setShowLoader(false), 500)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const playVideo = () => {
      video.play().catch((error) => {
        console.log("Video autoplay failed:", error)
      })
    }

    // Attempt to play video when metadata is loaded
    const handleCanPlay = () => {
      playVideo()
    }

    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("loadedmetadata", handleCanPlay)

    return () => {
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("loadedmetadata", handleCanPlay)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fallback: hide loader after 4 seconds to ensure content is visible
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(false)
    }, 4000)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Video Loading Animation Overlay */}
      {showLoader && (
        <div className={`absolute inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-700 ${
          showLoader ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}>
          <div className="relative flex flex-col items-center gap-6">
            {/* Main loader spinner */}
            <div className="loader"></div>
            
            {/* Loading text */}
            <div className="text-center space-y-2">
              <p className="text-base text-white/80 font-medium animate-pulse">Loading cinematic experience...</p>
              <p className="text-xs text-white/50">Preparing your visual journey</p>
            </div>
          </div>
        </div>
      )}

      {/* Background video with proper loading states */}
      <div className="absolute inset-0 h-full w-full bg-black overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23000' width='1920' height='1080'/%3E%3C/svg%3E"
          onCanPlay={handleVideoCanPlay}
          onLoadedData={handleVideoCanPlay}
          onError={handleVideoError}
          style={{
            transform: `translateY(${scrollY * 0.5}px) scale(${1 + scrollY * 0.0002})`,
          }}
          className={`h-full w-full object-cover transition-opacity duration-700 ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Try multiple video sources for better compatibility */}
          <source src="https://videos.pexels.com/video-files/3571468/3571468-sd_640_360_25fps.mp4" type="video/mp4" />
        </video>
      </div>

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
              className="border-white/30 text-white hover:bg-white/10 hover:text-white text-xs xs:text-sm sm:text-base px-5 xs:px-6 sm:px-8 py-4 xs:py-5 sm:py-6 h-auto font-semibold w-full sm:w-auto min-w-[180px] bg-transparent"
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

      {/* CSS for loader */}
      <style jsx>{`
        .loader {
          width: 70px;
          aspect-ratio: 1;
          display: grid;
          border: 4px solid transparent;
          border-radius: 50%;
          border-color: rgba(212, 165, 94, 0.2) transparent;
          animation: l16 1s infinite linear;
          position: relative;
        }
        .loader::before,
        .loader::after {    
          content: "";
          grid-area: 1/1;
          margin: 2px;
          border: inherit;
          border-radius: 50%;
          animation: inherit;
        }
        .loader::before {
          border-color: rgba(212, 165, 94, 0.8) transparent;
          animation-duration: .5s;
          animation-direction: reverse;
        }
        .loader::after {
          margin: 8px;
          border-color: rgba(212, 165, 94, 0.4) transparent;
          animation-duration: 2s;
        }
        @keyframes l16 { 
          100% { transform: rotate(1turn); }
        }
        
        /* Optional glow effect for the loader */
        .loader::before {
          box-shadow: 0 0 20px rgba(212, 165, 94, 0.3);
        }
      `}</style>
    </section>
  )
}
