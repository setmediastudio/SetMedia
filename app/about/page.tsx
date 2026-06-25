"use client"

import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Users, Heart, Zap, Award, ArrowRight, Sparkles, Play } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ParticlesBackground } from "@/components/particles-background"

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
  const [storyVisible, setStoryVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const storyRef = useRef<HTMLElement>(null)

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStoryVisible(true)
          }
        })
      },
      { threshold: 0.2 },
    )

    if (storyRef.current) {
      observer.observe(storyRef.current)
    }

    return () => observer.disconnect()
  }, [])

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
            Our Story
          </div>
          <h1 className="mb-6 font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-balance animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
            About <span className="text-gradient-gold">Set Media</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            We are storytellers, artists, and dreamers dedicated to capturing the extraordinary in every moment.
          </p>
        </div>
      </section>

      <section ref={storyRef} className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div
              className="transition-all duration-1000"
              style={{
                opacity: storyVisible ? 1 : 0,
                transform: storyVisible ? "translateX(0)" : "translateX(-50px)",
              }}
            >
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                <Play className="h-3 w-3" />
                Est. 2010
              </div>
              <h2 className="mb-6 font-serif text-4xl md:text-5xl font-bold">
                Our <span className="text-gradient-gold">Story</span>
              </h2>
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
            <div
              className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden transition-all duration-1000 delay-200"
              style={{
                opacity: storyVisible ? 1 : 0,
                transform: storyVisible ? "translateX(0)" : "translateX(50px)",
              }}
            >
              <Image
                src="/hero-poster.webp"
                alt="Set Media Studio"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="glass-card rounded-xl p-4 border border-white/10">
                  <p className="text-white font-medium">Behind the scenes at Set Media Studio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px]" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm text-primary">
              <Heart className="h-3 w-3" />
              What Drives Us
            </div>
            <h2 className="mb-4 font-serif text-4xl md:text-5xl font-bold">
              Our <span className="text-gradient-gold">Values</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide every project we undertake
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card
                key={index}
                className="border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-xl transition-all group"
              >
                <CardContent className="pt-8 pb-6">
                  <div className="mb-4 p-3 rounded-xl bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section ref={sectionRef} className="py-24 px-4">
        <div className="container mx-auto">
          <div className="glass-card rounded-2xl p-8 md:p-12 border border-primary/10">
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
                  <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient-gold mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-base md:text-lg text-muted-foreground">{achievement.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm text-primary">
              <Users className="h-3 w-3" />
              The Creatives
            </div>
            <h2 className="mb-4 font-serif text-4xl md:text-5xl font-bold">
              Meet Our <span className="text-gradient-gold">Team</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The talented individuals behind every stunning capture
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="border-primary/10 bg-card overflow-hidden group hover:shadow-xl hover:border-primary/20 transition-all"
              >
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardContent className="pt-6 pb-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary text-sm mb-3 font-medium">{member.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />

        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm text-primary">
              <Award className="h-3 w-3" />
              Let's Work Together
            </div>
            <h2 className="mb-6 font-serif text-4xl md:text-5xl lg:text-6xl font-bold">
              Let's Create <span className="text-gradient-gold">Together</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Ready to turn your vision into cinematic reality? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gold-glow text-lg px-8 py-6 group" asChild>
                <Link href="/contact">
                  Start Your Project
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent" asChild>
                <Link href="/portfolio">View Our Work</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
