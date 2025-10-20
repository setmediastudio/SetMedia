"use client"

import { MapPin, Phone, Mail, Instagram, Facebook, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"

export function ContactSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

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
                  123 Cinematic Avenue
                  <br />
                  Lagos, Nigeria
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="mb-2 text-lg font-semibold">Phone</h3>
                <p className="text-muted-foreground">+234 800 123 4567</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="mb-2 text-lg font-semibold">Email</h3>
                <p className="text-muted-foreground">info@setmedia.com</p>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
                >
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
                >
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
                >
                  <Youtube className="h-5 w-5" />
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
