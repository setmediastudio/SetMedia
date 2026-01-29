"use client"

import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight, User, BookOpen, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ParticlesBackground } from "@/components/particles-background"

interface BlogCategory {
  _id: string
  name: string
  slug: string
  description?: string
}

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  author: {
    name: string
  }
  category: {
    _id: string
    name: string
    slug: string
  }
  featuredImage?: string
  readTime?: string
  publishedAt?: string
  createdAt: string
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBlogData()
  }, [activeCategory])

  const fetchBlogData = async () => {
    try {
      const params = new URLSearchParams()
      if (activeCategory !== "all") {
        params.append("category", activeCategory)
      }

      const response = await fetch(`/api/blog?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
        setPosts(data.posts)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch blog data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ParticlesBackground />
        <MainNav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading blog...</p>
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
            <BookOpen className="h-3 w-3" />
            Insights & Stories
          </div>
          <h1 className="mb-6 font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-balance animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
            Our <span className="text-gradient-gold">Blog</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            Insights, stories, and tips from the world of cinematic photography and videography.
          </p>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-6 px-4 border-b border-border">
          <div className="container mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                onClick={() => setActiveCategory("all")}
                className={`rounded-full ${activeCategory === "all" ? "gold-glow" : "bg-transparent hover:bg-primary/10"}`}
                size="sm"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category._id}
                  variant={activeCategory === category.slug ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.slug)}
                  className={`rounded-full ${activeCategory === category.slug ? "gold-glow" : "bg-transparent hover:bg-primary/10"}`}
                  size="sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeCategory === "all" && posts.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
              <Sparkles className="h-3 w-3" />
              Featured Post
            </div>
            <Card className="border-primary/10 bg-card overflow-hidden group hover:shadow-xl hover:border-primary/20 transition-all">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-72 md:h-auto min-h-[300px] overflow-hidden">
                  <Image
                    src={posts[0].featuredImage || "/placeholder.svg?height=600&width=800&query=cinematic photography"}
                    alt={posts[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    quality={80}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <Badge className="w-fit mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-0">
                    {posts[0].category.name}
                  </Badge>
                  <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                    {posts[0].title}
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{posts[0].excerpt}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span>{posts[0].author.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{formatDate(posts[0].publishedAt || posts[0].createdAt)}</span>
                    </div>
                    {posts[0].readTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{posts[0].readTime}</span>
                      </div>
                    )}
                  </div>
                  <Button className="w-fit gold-glow group" asChild>
                    <Link href={`/blog/${posts[0].slug}`}>
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      <section className="py-16 px-4">
        <div className="container mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">No Blog Posts Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Check back soon for insights, stories, and tips from our team.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.slice(activeCategory === "all" ? 1 : 0).map((post) => (
                <Card
                  key={post._id}
                  className="border-primary/10 bg-card overflow-hidden group hover:shadow-xl hover:border-primary/20 transition-all"
                >
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={post.featuredImage || "/placeholder.svg?height=400&width=600&query=photography blog"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      quality={75}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <CardHeader className="pb-3">
                    <Badge className="w-fit mb-2 bg-primary/10 text-primary hover:bg-primary/20 border-0">
                      {post.category.name}
                    </Badge>
                    <h3 className="font-serif text-xl font-bold line-clamp-2 leading-tight">{post.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed text-sm">{post.excerpt}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{post.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                      </div>
                      {post.readTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.readTime}</span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" className="w-full bg-transparent hover:bg-primary/10 group" asChild>
                      <Link href={`/blog/${post.slug}`}>
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
