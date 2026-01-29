"use client"

import type React from "react"

import { useState } from "react"
import { Camera, Instagram, Facebook, Youtube, Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

// TikTok icon component
const Tiktok = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
)

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsSubscribing(true)

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        localStorage.setItem("newsletter-subscribed", "true")
        localStorage.setItem("newsletter-email", email)
        setIsSubscribed(true)
        setEmail("")

        toast({
          title: "Successfully subscribed!",
          description: "Check your inbox for a welcome message from Set Media.",
        })
      } else {
        throw new Error(data.error || "Subscription failed")
      }
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <footer className="border-t border-border bg-card">
      {/* Newsletter section - Better mobile padding */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-10 border border-primary/10 relative overflow-hidden">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-primary/5 rounded-full blur-[80px]" />

              <div className="relative z-10">
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
                      Stay in the <span className="text-gradient-gold">Frame</span>
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                      Subscribe to our newsletter for exclusive photography tips, behind-the-scenes content, and special
                      offers.
                    </p>
                  </div>

                  <div>
                    {!isSubscribed ? (
                      <form onSubmit={handleNewsletterSubmit} className="space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-9 sm:pl-10 h-11 sm:h-12 bg-background/50 border-border text-sm sm:text-base"
                              required
                            />
                          </div>
                          <Button
                            type="submit"
                            className="h-11 sm:h-12 px-5 sm:px-6 gold-glow"
                            disabled={isSubscribing}
                          >
                            {isSubscribing ? (
                              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </Button>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
                        </p>
                      </form>
                    ) : (
                      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground text-sm sm:text-base">You're subscribed!</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Check your inbox for a welcome message.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content - Better mobile padding and spacing */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand - Full width on small mobile */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-1">
            <div className="mb-3 sm:mb-4 flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <span className="font-serif text-xl sm:text-2xl font-bold">Set Media</span>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
              Capturing stories beyond the frame with cinematic excellence. Transform your precious moments into
              timeless art.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <a
                href="https://www.instagram.com/_setmedia?igsh=MTd6dTV5bGg1OHJqdw=="
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Instagram className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61573209824619"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Facebook className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Youtube className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
              <a
                href="https://vt.tiktok.com/ZSUHGYhvv/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Tiktok className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link
                  href="/portfolio"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                  Portfolio
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Services</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li className="text-muted-foreground flex items-center gap-2">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary/30" />
                Wedding Photography
              </li>
              <li className="text-muted-foreground flex items-center gap-2">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary/30" />
                Portrait Sessions
              </li>
              <li className="text-muted-foreground flex items-center gap-2">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary/30" />
                Event Videography
              </li>
              <li className="text-muted-foreground flex items-center gap-2">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary/30" />
                Corporate Photography
              </li>
              <li className="text-muted-foreground flex items-center gap-2">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary/30" />
                Fashion & Editorial
              </li>
            </ul>
          </div>

          {/* Contact - Full width on small mobile */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Contact</h3>
            <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
              <li className="flex items-start gap-2 sm:gap-3 text-muted-foreground">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div>
                  <p>27 Adeyi Avenue</p>
                  <p>Bodija, Ibadan, Nigeria</p>
                </div>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <span>+234 808 942 0137</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <span className="break-all">setmediastudio@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar - Better mobile layout */}
        <div className="border-t border-border pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-muted-foreground text-xs sm:text-sm text-center sm:text-left">
              © {currentYear} Set Media. All rights reserved.
            </p>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
