"use client"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Video, ImageIcon, Sparkles, CheckCircle2, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
        <MainNav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container mx-auto text-center">
          <h1 className="mb-6 font-serif text-6xl md:text-7xl font-bold text-balance animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Our Services
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            Professional photography and videography services tailored to capture your unique story with cinematic
            excellence.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          {services.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
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
                    className="border-border bg-card overflow-hidden group hover:shadow-xl transition-all"
                  >
                    {service.images && service.images.length > 0 ? (
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={service.images[0] || "/placeholder.svg"}
                          alt={service.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <div className="bg-primary/90 backdrop-blur-sm p-3 rounded-lg">
                            <IconComponent className="h-6 w-6 text-primary-foreground" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-64 bg-muted flex items-center justify-center">
                        <div className="bg-primary/90 backdrop-blur-sm p-6 rounded-lg">
                          <IconComponent className="h-12 w-12 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                      <Badge variant="secondary" className="w-fit">
                        Starting at {formatAmount(service.price, service.currency)}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
                      {service.features && service.features.length > 0 && (
                        <div className="space-y-2">
                          {service.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
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

      {/* Process Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-serif text-4xl md:text-5xl font-bold">Our Process</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A seamless journey from concept to delivery
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {process.map((item, index) => (
              <div key={index} className="text-center">
                <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="mb-6 font-serif text-4xl md:text-5xl font-bold">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Book a consultation to discuss your project and receive a custom quote tailored to your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gold-glow text-lg px-8 py-6" asChild>
              <Link href="/contact">Book Consultation</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent" asChild>
              <Link href="/portfolio">View Portfolio</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
