"use client"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Video, ImageIcon, Sparkles, CheckCircle2, Package, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ParticlesBackground } from "@/components/particles-background"

interface Service {
  _id: string
  title: string
  description: string
  type: string
  category: string
  price: number
  currency: string
  images: string[]
  features?: string[]
  icon?: string
  licenseType: string
  isActive: boolean
}

const iconMap: Record<string, any> = {
  Camera,
  Video,
  ImageIcon,
  Sparkles,
  Package,
}

const process = [
  {
    step: "01",
    title: "Consultation",
    description: "We start with a detailed discussion to understand your vision, requirements, and expectations.",
  },
  {
    step: "02",
    title: "Planning",
    description: "Our team creates a comprehensive plan including timeline, locations, and creative direction.",
  },
  {
    step: "03",
    title: "Production",
    description: "On the day, we capture your story with professional equipment and artistic expertise.",
  },
  {
    step: "04",
    title: "Post-Production",
    description: "Meticulous editing, color grading, and retouching to perfect every frame.",
  },
  {
    step: "05",
    title: "Delivery",
    description: "Receive your final images or videos through our secure online gallery with download options.",
  },
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      if (response.ok) {
        const data = await response.json()
        setServices(data.services)
      }
    } catch (error) {
      console.error("Failed to fetch services:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number, currency = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const getIcon = (iconName?: string) => {
    if (!iconName) return Camera
    return iconMap[iconName] || Camera
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ParticlesBackground />
        <MainNav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        </div>
      </div>
    )
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
            <Sparkles className="h-3 w-3" />
            What We Offer
          </div>
          <h1 className="mb-6 font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-balance animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
            Our <span className="text-gradient-gold">Services</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            Professional photography and videography services tailored to capture your unique story with cinematic
            excellence.
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          {services.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Services Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're currently updating our services. Check back soon to see what we offer.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const IconComponent = getIcon(service.icon)
                return (
                  <Card
                    key={service._id}
                    className="border-primary/10 bg-card overflow-hidden group hover:shadow-xl hover:border-primary/20 transition-all animate-in fade-in slide-in-from-bottom-4 duration-700"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {service.images && service.images.length > 0 ? (
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={service.images[0] || "/placeholder.svg"}
                          alt={service.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <div className="p-3 rounded-xl bg-primary/90 backdrop-blur-sm">
                            <IconComponent className="h-6 w-6 text-primary-foreground" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-56 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <div className="p-6 rounded-2xl bg-primary/10">
                          <IconComponent className="h-12 w-12 text-primary" />
                        </div>
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                      <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/20 border-0">
                        Starting at {formatAmount(service.price, service.currency)}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
                      {service.features && service.features.length > 0 && (
                        <div className="space-y-2">
                          {service.features.slice(0, 4).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm text-primary">
              <Sparkles className="h-3 w-3" />
              How We Work
            </div>
            <h2 className="mb-4 font-serif text-4xl md:text-5xl font-bold">
              Our <span className="text-gradient-gold">Process</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A seamless journey from concept to delivery
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {process.map((item, index) => (
              <div
                key={index}
                className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="mb-4 mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="text-2xl font-bold text-gradient-gold">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />

        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-6 font-serif text-4xl md:text-5xl font-bold">
              Ready to Get <span className="text-gradient-gold">Started?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Book a consultation to discuss your project and receive a custom quote tailored to your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gold-glow text-lg px-8 py-6 group" asChild>
                <Link href="/contact">
                  Book Consultation
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent" asChild>
                <Link href="/portfolio">View Portfolio</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
