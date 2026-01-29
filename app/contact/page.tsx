"use client"

import type React from "react"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { ParticlesBackground } from "@/components/particles-background"

// TikTok icon component
const Tiktok = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
)

export default function ContactPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const formRef = useRef<HTMLElement>(null)
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    service: "",
    message: "",
  })

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

    if (formRef.current) {
      observer.observe(formRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const resetForm = () => {
    setIsSubmitted(false)
    setFormData({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: "",
      service: "",
      message: "",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <ParticlesBackground />

      <MainNav />

      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

        <div className="container mx-auto text-center relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <MessageSquare className="h-3 w-3" />
            Let's Connect
          </div>
          <h1 className="mb-6 font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-balance animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
            Get in <span className="text-gradient-gold">Touch</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            Let's discuss your project and bring your vision to life. We're here to answer all your questions.
          </p>
        </div>
      </section>

      <section ref={formRef} className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <Card
              className="lg:col-span-2 border-primary/10 bg-card transition-all duration-1000"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateX(0)" : "translateX(-50px)",
              }}
            >
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl font-serif">Send Us a Message</CardTitle>
                <p className="text-muted-foreground">Fill out the form below and we'll respond within 24 hours.</p>
              </CardHeader>
              <CardContent>
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="bg-muted/50"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="bg-muted/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+234 800 000 0000"
                          className="bg-muted/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service">Service Interested In *</Label>
                        <select
                          id="service"
                          name="service"
                          value={formData.service}
                          onChange={handleChange}
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Select a service</option>
                          <option value="wedding">Wedding Photography</option>
                          <option value="portrait">Portrait Sessions</option>
                          <option value="event">Event Videography</option>
                          <option value="fashion">Fashion & Editorial</option>
                          <option value="corporate">Corporate Photography</option>
                          <option value="commercial">Commercial Video</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Your Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your project, event date, location, and any specific requirements..."
                        rows={5}
                        className="bg-muted/50 resize-none"
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full gold-glow" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </div>
                      ) : (
                        <>
                          Send Message <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mb-6 mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
                      <CheckCircle2 className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold mb-3">Message Sent!</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <Button onClick={resetForm} variant="outline" className="bg-transparent">
                      Send Another Message
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div
              className="space-y-6 transition-all duration-1000 delay-200"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateX(0)" : "translateX(50px)",
              }}
            >
              <Card className="border-primary/10 bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Address</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        27 Adeyi Avenue
                        <br />
                        Bodija, Ibadan, Nigeria
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-sm text-muted-foreground">+234 808 942 0137</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-sm text-muted-foreground">setmediastudio@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Business Hours</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Mon - Fri: 9:00 AM - 4:00 PM
                        <br />
                        Sat: By Appointment
                        <br />
                        Sun: Closed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Follow Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-transparent hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                      asChild
                    >
                      <a
                        href="https://www.instagram.com/_setmedia?igsh=MTd6dTV5bGg1OHJqdw=="
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-transparent hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                      asChild
                    >
                      <a
                        href="https://www.facebook.com/profile.php?id=61573209824619"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-transparent hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                      asChild
                    >
                      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                        <Youtube className="h-5 w-5" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-transparent hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                      asChild
                    >
                      <a href="https://vt.tiktok.com/ZSUHGYhvv/" target="_blank" rel="noopener noreferrer">
                        <Tiktok className="h-5 w-5" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm text-primary">
              <MapPin className="h-3 w-3" />
              Our Location
            </div>
            <h2 className="mb-4 font-serif text-4xl md:text-5xl font-bold">
              Visit Our <span className="text-gradient-gold">Studio</span>
            </h2>
            <p className="text-xl text-muted-foreground">Drop by for a consultation or to see our work in person</p>
          </div>

          <div className="h-[500px] overflow-hidden rounded-2xl border border-primary/10 shadow-xl">
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
      </section>

      <Footer />
    </div>
  )
}
