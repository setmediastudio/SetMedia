"use client"

import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"

// TikTok icon component
const Tiktok = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
)

export function ContactSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const socialLinks = {
    instagram: "https://www.instagram.com/_setmedia?igsh=MTd6dTV5bGg1OHJqdw==",
    facebook: "https://www.facebook.com/profile.php?id=61573209824619",
    youtube: "https://youtube.com/setmediastudio",
    tiktok: "https://vt.tiktok.com/ZSUHGYhvv/",
  }

  const handleSocialClick = (platform: keyof typeof socialLinks) => {
    window.open(socialLinks[platform], "_blank", "noopener,noreferrer")
  }

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

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative py-16 sm:py-24 px-4 bg-gradient-to-b from-background via-muted/10 to-background overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-[150px]" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div
          className="mb-10 sm:mb-16 text-center transition-all duration-1000"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary/30 bg-primary/10 text-xs sm:text-sm text-primary">
            <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Get In Touch
          </div>
          <h2 className="mb-3 sm:mb-4 font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
            Visit <span className="text-gradient-gold">Us</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">Let's bring your story to life.</p>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-2">
          {/* Contact Info */}
          <div
            className="space-y-4 sm:space-y-6 lg:space-y-8 transition-all duration-1000 delay-200"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(50px)",
            }}
          >
            <div className="glass-card rounded-xl p-4 sm:p-6 border border-primary/10 hover:border-primary/20 transition-colors">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1.5 sm:mb-2 text-base sm:text-lg font-semibold">Address</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    27 Adeyi Avenue
                    <br />
                    Bodija, Ibadan, Nigeria
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 sm:p-6 border border-primary/10 hover:border-primary/20 transition-colors">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1.5 sm:mb-2 text-base sm:text-lg font-semibold">Phone</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">+234 808 942 0137</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 sm:p-6 border border-primary/10 hover:border-primary/20 transition-colors">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1.5 sm:mb-2 text-base sm:text-lg font-semibold">Email</h3>
                  <p className="text-muted-foreground text-sm sm:text-base break-all">setmediastudio@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 sm:p-6 border border-primary/10">
              <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">Follow Us</h3>
              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-transparent hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all h-10 w-10 sm:h-11 sm:w-11"
                  onClick={() => handleSocialClick("instagram")}
                >
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-transparent hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all h-10 w-10 sm:h-11 sm:w-11"
                  onClick={() => handleSocialClick("facebook")}
                >
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-transparent hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all h-10 w-10 sm:h-11 sm:w-11"
                  onClick={() => handleSocialClick("youtube")}
                >
                  <Youtube className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-transparent hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all h-10 w-10 sm:h-11 sm:w-11"
                  onClick={() => handleSocialClick("tiktok")}
                >
                  <Tiktok className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>

            <Button size="lg" className="w-full gold-glow group text-sm sm:text-base h-11 sm:h-12" asChild>
              <Link href="/contact">
                Get In Touch
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Map - Better mobile height */}
          <div
            className="h-[350px] sm:h-[400px] lg:h-[500px] overflow-hidden rounded-xl border border-primary/10 transition-all duration-1000 delay-400 shadow-xl"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(50px)",
            }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3379.809761311444!2d3.901827080726324!3d7.414194120647984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10398decef429ee1%3A0x1848432ab72acd5b!2sCSMTECH!5e0!3m2!1sen!2sng!4v1764152940278!5m2!1sen!2sng"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(1) invert(1) contrast(0.8)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
