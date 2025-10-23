"use client"

import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"

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
        <MainNav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading blog...</p>
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
            Our Blog
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            Insights, stories, and tips from the world of cinematic photography and videography.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      {categories.length > 0 && (
        <section className="py-8 px-4 border-b border-border">
          <div className="container mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                onClick={() => setActiveCategory("all")}
                className={activeCategory === "all" ? "gold-glow" : ""}
                size="sm"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category._id}
                  variant={activeCategory === category.slug ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.slug)}
                  className={activeCategory === category.slug ? "gold-glow" : ""}
                  size="sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Post */}
      {activeCategory === "all" && posts.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <Badge className="mb-4">Featured Post</Badge>
            <Card className="border-border bg-card overflow-hidden group hover:shadow-xl transition-all">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-80 md:h-auto overflow-hidden">
                  <Image
                    src={posts[0].featuredImage || "/placeholder.svg?height=600&width=800"}
                    alt={posts[0].title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    quality={80}
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge variant="secondary" className="w-fit mb-4">
                    {posts[0].category.name}
                  </Badge>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">{posts[0].title}</h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{posts[0].excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{posts[0].author.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(posts[0].publishedAt || posts[0].createdAt)}</span>
                    </div>
                    {posts[0].readTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{posts[0].readTime}</span>
                      </div>
                    )}
                  </div>
                  <Button className="w-fit gold-glow" asChild>
                    <Link href={`/blog/${posts[0].slug}`}>
                      Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20">
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
                  className="border-border bg-card overflow-hidden group hover:shadow-xl transition-all"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={post.featuredImage || "/placeholder.svg?height=400&width=600"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      quality={75}
                    />
                  </div>
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">
                      {post.category.name}
                    </Badge>
                    <h3 className="font-serif text-2xl font-bold mb-2 line-clamp-2">{post.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
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
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href={`/blog/${post.slug}`}>
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-serif text-4xl md:text-5xl font-bold">Stay Updated</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Subscribe to our newsletter for the latest tips, stories, and exclusive content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="gold-glow">Subscribe</Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
