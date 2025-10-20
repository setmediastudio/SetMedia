"use client"

import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Users, Heart, Zap } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

const teamMembers = [
  {
    name: "Alex Johnson",
    role: "Founder & Lead Photographer",
    image: "/professional-photographer-portrait.png",
    bio: "15+ years capturing life's most precious moments",
  },
  {
    name: "Sarah Williams",
    role: "Creative Director",
    image: "/creative-director-portrait.png",
    bio: "Award-winning visual storyteller and cinematographer",
  },
  {
    name: "Michael Chen",
    role: "Senior Photographer",
    image: "/asian-photographer-portrait.jpg",
    bio: "Specialist in wedding and event photography",
  },
  {
    name: "Emma Davis",
    role: "Post-Production Lead",
    image: "/female-editor-portrait.jpg",
    bio: "Master of color grading and cinematic editing",
  },
]

const values = [
  {
    icon: Camera,
    title: "Artistic Excellence",
    description: "We approach every project with a commitment to creating art that transcends ordinary photography.",
  },
  {
    icon: Heart,
    title: "Authentic Storytelling",
    description: "Your story is unique, and we capture it with genuine emotion and authenticity.",
  },
  {
    icon: Users,
    title: "Client Partnership",
    description: "We collaborate closely with you to ensure your vision comes to life perfectly.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Constantly evolving our techniques to deliver cutting-edge cinematic experiences.",
  },
]

const achievements = [
  { number: "500+", label: "Projects Completed" },
  { number: "15+", label: "Years Experience" },
  { number: "50+", label: "Awards Won" },
  { number: "98%", label: "Client Satisfaction" },
]

export default function AboutPage() {
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
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container mx-auto text-center">
          <h1 className="mb-6 font-serif text-6xl md:text-7xl font-bold text-balance animate-in fade-in slide-in-from-bottom-4 duration-1000">
            About Set Media
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            We are storytellers, artists, and dreamers dedicated to capturing the extraordinary in every moment.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-6 font-serif text-4xl md:text-5xl font-bold">Our Story</h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2010, Set Media began with a simple vision: to transform ordinary moments into cinematic
                  masterpieces. What started as a passion project has evolved into a premier photography and videography
                  studio trusted by clients worldwide.
                </p>
                <p>
                  Our journey has been defined by an unwavering commitment to artistic excellence and authentic
                  storytelling. We believe that every frame should evoke emotion, every shot should tell a story, and
                  every project should be a work of art.
                </p>
                <p>
                  Today, we're proud to have captured over 500 stories, won numerous industry awards, and built lasting
                  relationships with clients who trust us with their most precious memories.
                </p>
              </div>
            </div>
            <div className="relative h-[500px] rounded-lg overflow-hidden">
              <Image
                src="/cinematic-photography-studio-behind-the-scenes.jpg"
                alt="Set Media Studio"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-serif text-4xl md:text-5xl font-bold">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide every project we undertake
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <value.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section ref={sectionRef} className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="text-center transition-all duration-700"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(30px)",
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">{achievement.number}</div>
                <div className="text-lg text-muted-foreground">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-serif text-4xl md:text-5xl font-bold">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The talented individuals behind every stunning capture
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="border-border bg-card overflow-hidden group hover:shadow-xl transition-all">
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary text-sm mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="mb-6 font-serif text-4xl md:text-5xl font-bold">Let's Create Together</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ready to turn your vision into cinematic reality? We'd love to hear from you.
          </p>
          <Button size="lg" className="gold-glow text-lg px-8 py-6" asChild>
            <a href="/contact">Start Your Project</a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
