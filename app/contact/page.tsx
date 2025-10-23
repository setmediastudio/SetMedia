"use client"

import type React from "react"

import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, Clock, Send } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

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

export default function ContactPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    service: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. We'll get back to you within 24 hours.",
    })

    setIsSubmitting(false)
    setFormData({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: "",
      service: "",
      message: "",
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container mx-auto text-center">
          <h1 className="mb-6 font-serif text-6xl md:text-7xl font-bold text-balance animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            Let's discuss your project and bring your vision to life. We're here to answer all your questions.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <Card className="lg:col-span-2 border-border bg-card">
              <CardHeader>
                <CardTitle className="text-3xl font-serif">Send Us a Message</CardTitle>
                <p className="text-muted-foreground">Fill out the form below and we'll respond within 24 hours.</p>
              </CardHeader>
              <CardContent>
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
                        placeholder="+1 (555) 000-0000"
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
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full gold-glow" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
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
                    <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-sm text-muted-foreground">+234 808 942 1037</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-sm text-muted-foreground">setmediastudio@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
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

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Follow Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
                      asChild
                    >
                      <a href="https://www.instagram.com/_setmedia?igsh=MTd6dTV5bGg1OHJqdw==" target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-5 w-5" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
                      asChild
                    >
                      <a href="https://www.facebook.com/profile.php?id=61573209824619" target="_blank" rel="noopener noreferrer">
                        <Facebook className="h-5 w-5" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
                      asChild
                    >
                      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                        <Youtube className="h-5 w-5" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
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

      {/* Map Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="mb-4 font-serif text-4xl md:text-5xl font-bold">Visit Our Studio</h2>
            <p className="text-xl text-muted-foreground">Drop by for a consultation or to see our work in person</p>
          </div>

          <div className="h-[500px] overflow-hidden rounded-lg border border-border">
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
      </section>

      <Footer />
    </div>
  )
}