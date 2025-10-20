"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Video } from "lucide-react"

interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
}

interface Upload {
  _id: string
  fileName: string
  originalName: string
  fileSize: number
  fileType: string
  publicUrl: string
  title?: string
  description?: string
  portfolioCategory: {
    _id: string
    name: string
    slug: string
  }
  createdAt: string
}

export function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [categories, setCategories] = useState<Category[]>([])
  const [uploads, setUploads] = useState<Upload[]>([])
  const [filteredUploads, setFilteredUploads] = useState<Upload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    fetchPortfolioData()
  }, [])

  useEffect(() => {
    filterUploads()
  }, [activeCategory, uploads])

  useEffect(() => {
    const observers = itemRefs.current.map((ref, index) => {
      if (!ref) return null

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                setVisibleItems((prev) => new Set(prev).add(index))
              }, index * 100)
            }
          })
        },
        { threshold: 0.2 },
      )

      observer.observe(ref)
      return observer
    })

    return () => {
      observers.forEach((observer) => observer?.disconnect())
    }
  }, [filteredUploads])

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch("/api/portfolio")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
        setUploads(data.uploads)
      }
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterUploads = () => {
    let filtered = uploads

    if (activeCategory !== "all") {
      filtered = filtered.filter((upload) => upload.portfolioCategory?.slug === activeCategory)
    }

    // Sort by creation date (newest first) and limit to 15 items
    filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 15)

    setFilteredUploads(filtered)
    setVisibleItems(new Set())
  }

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug)
    setVisibleItems(new Set())
  }

  if (isLoading) {
    return (
      <section id="portfolio" className="relative py-24 px-4 bg-gradient-to-b from-black to-card">
        <div className="container mx-auto">
          <div className="flex items-center justify-center min-h-[40vh]">
            <p className="text-muted-foreground">Loading portfolio...</p>
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0 && uploads.length === 0) {
    return (
      <section id="portfolio" className="relative py-24 px-4 bg-gradient-to-b from-black to-card">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-5xl font-bold text-balance">Our Work Speaks in Frames</h2>
            <p className="text-xl text-muted-foreground">A curated selection of our most cinematic captures</p>
          </div>
          <div className="text-center py-20">
            <p className="text-muted-foreground max-w-md mx-auto">
              Our portfolio is being curated. Check back soon to see our latest work.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="portfolio" className="relative py-24 px-4 bg-gradient-to-b from-black to-card">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-5xl font-bold text-balance">Our Work Speaks in Frames</h2>
          <p className="text-xl text-muted-foreground">A curated selection of our most cinematic captures</p>
        </div>

        <div className="mb-12 flex flex-wrap justify-center gap-4">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            onClick={() => handleCategoryChange("all")}
            className={activeCategory === "all" ? "gold-glow" : ""}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category._id}
              variant={activeCategory === category.slug ? "default" : "outline"}
              onClick={() => handleCategoryChange(category.slug)}
              className={activeCategory === category.slug ? "gold-glow" : ""}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {filteredUploads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found in this category.</p>
          </div>
        ) : (
          <div className="columns-1 gap-6 md:columns-2 lg:columns-3 xl:columns-4">
            {filteredUploads.map((item, index) => (
              <div
                key={item._id}
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                className="group relative mb-6 break-inside-avoid overflow-hidden rounded-lg cursor-pointer transition-all duration-700"
                style={{
                  opacity: visibleItems.has(index) ? 1 : 0,
                  transform: visibleItems.has(index)
                    ? "translateY(0) rotate(0deg) scale(1)"
                    : "translateY(50px) rotate(-5deg) scale(0.9)",
                }}
              >
                {item.fileType.startsWith("video/") ? (
                  <div className="relative">
                    <video
                      src={item.publicUrl}
                      className="w-full transition-transform duration-500 group-hover:scale-110"
                      muted
                      loop
                      playsInline
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause()
                        e.currentTarget.currentTime = 0
                      }}
                    />
                    <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </Badge>
                  </div>
                ) : (
                  <Image
                    src={item.publicUrl || "/placeholder.svg"}
                    alt={item.title || item.originalName}
                    width={600}
                    height={600}
                    className="w-full transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute bottom-4 left-4 right-4">
                    {item.title && <p className="text-lg font-semibold text-white mb-1">{item.title}</p>}
                    {item.description && <p className="text-sm text-white/80 line-clamp-2 mb-2">{item.description}</p>}
                    <span className="inline-block text-xs text-primary font-medium">{item.portfolioCategory.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" asChild>
            <a href="/portfolio">View Full Portfolio</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
