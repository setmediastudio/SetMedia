"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Video, ArrowRight, Sparkles } from "lucide-react"
import { ImageSkeletonLoader } from "./image-skeleton-loader"

interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
  parentCategoryId?: string | null
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
    parentCategoryId?: string | null
  }
  createdAt: string
}

export function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeSubCategory, setActiveSubCategory] = useState<string | undefined>(undefined)
  const [categories, setCategories] = useState<Category[]>([])
  const [uploads, setUploads] = useState<Upload[]>([])
  const [filteredUploads, setFilteredUploads] = useState<Upload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const sectionRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const [groupedBySubCategory, setGroupedBySubCategory] = useState(true)

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
              // Stagger reveals with reduced delay for better performance
              setTimeout(() => {
                setVisibleItems((prev) => new Set(prev).add(index))
              }, Math.min(index * 30, 300))
            }
          })
        },
        { threshold: 0.05, rootMargin: "100px" },
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
        // Use allCategories to include both parent and sub-categories
        setCategories(data.allCategories || data.categories)
        setUploads(data.uploads)
      }
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const groupUploadsByCategory = (uploads: Upload[]) => {
    const grouped: { [categoryId: string]: Upload[] } = {}

    uploads.forEach((upload) => {
      const categoryId = upload.portfolioCategory?._id || "uncategorized"
      if (!grouped[categoryId]) {
        grouped[categoryId] = []
      }
      grouped[categoryId].push(upload)
    })

    // Limit to 10 latest per category/subcategory
    Object.keys(grouped).forEach((categoryId) => {
      grouped[categoryId] = grouped[categoryId]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
    })

    // Flatten back to array maintaining the 10-per-category limit
    return Object.values(grouped).flat()
  }

  const filterUploads = () => {
    let filtered = uploads

    if (activeCategory !== "all") {
      const activeCategory_ = categories.find((cat) => cat.slug === activeCategory)
      if (activeCategory_) {
        // Check if it's a parent category or sub-category
        const isParent = !activeCategory_.parentCategoryId
        const activeCatId = activeCategory_._id

        if (isParent) {
          // If parent, include all items from parent AND sub-categories
          const subCatIds = categories
            .filter((cat) => cat.parentCategoryId === activeCategory_._id)
            .map((cat) => cat._id)

          filtered = filtered.filter((upload) => {
            const uploadCatId = upload.portfolioCategory?._id
            return uploadCatId === activeCatId || subCatIds.includes(uploadCatId)
          })
        } else {
          // If sub-category, only show items from that sub-category
          filtered = filtered.filter((upload) => {
            const uploadCatId = upload.portfolioCategory?._id
            return uploadCatId === activeCatId
          })
        }
      }
    }

    // Sort by creation date and limit to 10 per category for landing page
    filtered = filtered
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Apply per-category limit for landing page portfolio section
    filtered = groupUploadsByCategory(filtered)

    setFilteredUploads(filtered)
    setVisibleItems(new Set())
  }

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug)
    setActiveSubCategory(undefined)
    setVisibleItems(new Set())
  }

  const getRootCategories = () => {
    return categories.filter((cat) => !cat.parentCategoryId)
  }

  const getSubCategories = (parentSlug: string) => {
    const parentCat = categories.find((cat) => cat.slug === parentSlug)
    if (!parentCat) return []
    return categories.filter((cat) => cat.parentCategoryId === parentCat._id).sort((a, b) => a.order - b.order)
  }

  const groupUploadsBySubCategory = () => {
    const grouped: { [key: string]: Upload[] } = {}

    filteredUploads.forEach((upload) => {
      const categoryName = upload.portfolioCategory?.name || "Uncategorized"
      if (!grouped[categoryName]) {
        grouped[categoryName] = []
      }
      grouped[categoryName].push(upload)
    })

    return Object.entries(grouped).map(([categoryName, items]) => ({
      categoryName,
      items,
    }))
  }

  if (isLoading) {
    return (
      <section
        id="portfolio"
        className="relative py-24 px-4 bg-gradient-to-b from-background via-muted/10 to-background"
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Loading portfolio...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0 && uploads.length === 0) {
    return (
      <section
        id="portfolio"
        className="relative py-24 px-4 bg-gradient-to-b from-background via-muted/10 to-background"
      >
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

  const rootCategories = categories.filter((cat) => !cat.parentCategoryId)
  const currentParentCategory = rootCategories.find((cat) => cat.slug === activeCategory)
  const subCategoriesToShow = currentParentCategory
    ? categories.filter((cat) => cat.parentCategoryId === currentParentCategory._id)
    : []

  const groupedItems = groupUploadsBySubCategory()

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="relative py-24 px-4 bg-gradient-to-b from-background via-muted/10 to-background overflow-hidden"
    >
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />

      <div className="container mx-auto relative z-10">
        <div className="mb-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm text-primary">
            <Sparkles className="h-3 w-3" />
            Featured Work
          </div>
          <h2 className="mb-4 font-serif text-5xl md:text-6xl font-bold text-balance">
            Our Work Speaks in <span className="text-gradient-gold">Frames</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A curated selection of our most cinematic captures, each telling a unique story
          </p>
        </div>

        {/* Main Category filters */}
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            onClick={() => handleCategoryChange("all")}
            className={`rounded-full transition-all ${activeCategory === "all" ? "gold-glow" : "bg-transparent hover:bg-primary/10"}`}
          >
            All
          </Button>
          {getRootCategories().map((category) => {
            const hasActiveSubCategory = categories.some(
              (c) => c.parentCategoryId === category._id && activeCategory === c.slug,
            )
            const isActive = activeCategory === category.slug

            return (
              <Button
                key={category._id}
                variant={isActive ? "default" : "outline"}
                onClick={() => handleCategoryChange(category.slug)}
                className={`rounded-full px-6 py-2.5 h-auto text-base font-semibold transition-all ${
                  isActive || hasActiveSubCategory
                    ? "gold-glow bg-primary text-primary-foreground"
                    : "bg-transparent hover:bg-primary/10"
                }`}
              >
                {category.name}
              </Button>
            )
          })}
        </div>

        {/* Sub-category filters - show when parent category is selected OR when a sub-category is currently selected */}
        {activeCategory !== "all" && (
          (() => {
            const activeCat = categories.find((c) => c.slug === activeCategory)
            const isParentCategory = activeCat && !activeCat.parentCategoryId
            const parentCategorySlug = isParentCategory 
              ? activeCategory 
              : categories.find((c) => c._id === activeCat?.parentCategoryId)?.slug
            const subCatsToShow = parentCategorySlug ? getSubCategories(parentCategorySlug) : []
            
            return subCatsToShow.length > 0 ? (
              <div className="mb-8 flex flex-wrap justify-center gap-3">
                {subCatsToShow.map((subCat) => (
                  <Button
                    key={subCat._id}
                    variant={activeCategory === subCat.slug ? "default" : "outline"}
                    onClick={() => handleCategoryChange(subCat.slug)}
                    className={`rounded-full px-5 py-2 h-auto font-medium transition-all ${
                      activeCategory === subCat.slug
                        ? "gold-glow bg-primary text-primary-foreground"
                        : "bg-transparent hover:bg-primary/10 border-muted-foreground/50 text-foreground/70 hover:border-primary/60 hover:text-foreground"
                    }`}
                  >
                    {subCat.name}
                  </Button>
                ))}
              </div>
            ) : null
          })()
        )}

        {filteredUploads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found in this category.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {groupedItems.map((group, groupIndex) => (
              <div key={group.categoryName} className="space-y-6">
                <h3 className="text-2xl font-semibold text-foreground border-b pb-3">{group.categoryName}</h3>
                <div className="columns-1 gap-6 md:columns-2 lg:columns-3 xl:columns-4">
                  {group.items.map((item, index) => {
                    const itemIndex = groupIndex * 100 + index
                    return (
                      <div
                        key={item._id}
                        ref={(el) => {
                          itemRefs.current[itemIndex] = el
                        }}
                        className="group relative mb-6 break-inside-avoid overflow-hidden rounded-xl cursor-pointer transition-all duration-700 will-change-transform border border-transparent hover:border-primary/20"
                        style={{
                          opacity: visibleItems.has(itemIndex) ? 1 : 0,
                          transform: visibleItems.has(itemIndex)
                            ? "translateY(0) scale(1)"
                            : "translateY(50px) scale(0.95)",
                        }}
                      >
                        {item.fileType.startsWith("video/") ? (
                          <div className="relative bg-muted overflow-hidden">
                            <video
                              src={item.publicUrl}
                              className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                              muted
                              loop
                              playsInline
                              preload="none"
                              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect fill='%23333' width='600' height='600'/%3E%3C/svg%3E"
                              onError={() => {
                                console.warn(`Failed to load video: ${item.publicUrl}`)
                              }}
                              onMouseEnter={(e) => {
                                const video = e.currentTarget
                                video.preload = "auto"
                                video.play().catch(() => {})
                              }}
                              onMouseLeave={(e) => {
                                const video = e.currentTarget
                                video.pause()
                                video.currentTime = 0
                              }}
                            />
                            <Badge className="absolute top-3 right-3 bg-black/70 text-white backdrop-blur-sm">
                              <Video className="h-3 w-3 mr-1" />
                              Video
                            </Badge>
                          </div>
                        ) : (
                          <div className="relative w-full bg-muted overflow-hidden" style={{ aspectRatio: "1/1" }}>
                            <ImageSkeletonLoader
                              src={item.sdPublicUrl || item.publicUrl || "/placeholder.svg"}
                              alt={item.title || item.originalName}
                              fallbackSrc={item.publicUrl || "/placeholder.svg"}
                              className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                              aspectRatio="square"
                            />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <div className="absolute bottom-4 left-4 right-4">
                            {item.title && <p className="text-lg font-semibold text-white mb-1">{item.title}</p>}
                            {item.description && (
                              <p className="text-sm text-white/80 line-clamp-2 mb-2">{item.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {item.portfolioCategory?.parentCategoryName && (
                                <span className="inline-block text-xs text-white/90 font-medium px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                                  {item.portfolioCategory.parentCategoryName}
                                </span>
                              )}
                              <span className="inline-block text-xs text-primary font-medium px-2 py-1 rounded-full bg-primary/20 backdrop-blur-sm">
                                {item.portfolioCategory.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Button
            size="lg"
            variant="outline"
            className="group rounded-full bg-transparent hover:bg-primary/10 px-8"
            asChild
          >
            <a href="/portfolio">
              View Full Portfolio
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
