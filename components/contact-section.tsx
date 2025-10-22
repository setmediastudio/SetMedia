"use client"

import { MapPin, Phone, Mail, Instagram, Facebook, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"

// TikTok icon component since it's not available in lucide-react
const Tiktok = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
)

export function ContactSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  // Social media links
  const socialLinks = {
    instagram: "https://www.instagram.com/_setmedia?igsh=MTd6dTV5bGg1OHJqdw==",
    facebook: "https://www.facebook.com/profile.php?id=61573209824619", 
    youtube: "https://youtube.com/setmediastudio",
    tiktok: "https://vt.tiktok.com/ZSUHGYhvv/"
  }

  const handleSocialClick = (platform: keyof typeof socialLinks) => {
    window.open(socialLinks[platform], '_blank', 'noopener,noreferrer')
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
    <section ref={sectionRef} id="contact" className="relative py-24 px-4 bg-card">
      <div className="container mx-auto max-w-6xl">
        <div
          className="mb-12 text-center transition-all duration-1000"
          style={{
            opacity: isVisible ? 1 : 0,
            filter: isVisible ? "blur(0px)" : "blur(10px)",
            transform: isVisible ? "scale(1)" : "scale(0.9)",
          }}
        >
          <h2 className="mb-4 font-serif text-5xl font-bold text-balance">Visit Us</h2>
          <p className="text-xl text-muted-foreground">Let's bring your story to life.</p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Info */}
          <div
            className="space-y-8 transition-all duration-1000 delay-200"
            style={{
              opacity: isVisible ? 1 : 0,
              filter: isVisible ? "blur(0px)" : "blur(5px)",
              transform: isVisible ? "translateY(0)" : "translateY(50px)",
            }}
          >
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="mb-2 text-lg font-semibold">Address</h3>
                <p className="text-muted-foreground leading-relaxed">
                  27 Adeyi Avenue
                  <br />
                  Bodija, Ibadan, Nigeria
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="mb-2 text-lg font-semibold">Phone</h3>
                <p className="text-muted-foreground">+234 808 942 1037</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="mb-2 text-lg font-semibold">Email</h3>
                <p className="text-muted-foreground">info@setmediastudio.com</p>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
                  onClick={() => handleSocialClick('instagram')}
                >
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
                  onClick={() => handleSocialClick('facebook')}
                >
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
                  onClick={() => handleSocialClick('youtube')}
                >
                  <Youtube className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
                  onClick={() => handleSocialClick('tiktok')}
                >
                  <Tiktok className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Map */}
          <div
            className="h-[400px] overflow-hidden rounded-lg border border-border transition-all duration-1000 delay-400"
            style={{
              opacity: isVisible ? 1 : 0,
              filter: isVisible ? "blur(0px)" : "blur(10px)",
              transform: isVisible ? "scale(1) rotate(0deg)" : "scale(0.95) rotate(2deg)",
            }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7276583086!2d3.3792057!3d6.4281395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjUnNDEuMyJOIDPCsDIyJzQ1LjEiRQ!5e0!3m2!1sen!2sng!4v1234567890"
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