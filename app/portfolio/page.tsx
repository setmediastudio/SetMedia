"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Video, Bookmark, BookmarkCheck, Maximize2, Share2, Heart } from "lucide-react"
import { MediaProtection } from "@/components/media-protection"
import { DownloadModal } from "@/components/download-modal"
import { useToast } from "@/hooks/use-toast"
import { useAuthModal } from "@/lib/auth-modal-context"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Image from "next/image"
import { ParticlesBackground } from "@/components/particles-background"
import { ImageSkeletonLoader } from "@/components/image-skeleton-loader"
import { groupUploadsBySubCategory } from "@/utils/groupUploadsBySubCategory" // Import groupUploadsBySubCategory

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
  sdPublicUrl?: string
  title?: string
  description?: string
  hdPrice?: number
  portfolioCategory: {
    _id: string
    name: string
    slug: string
    parentCategoryName?: string
  }
  createdAt: string
}

export default function PortfolioPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const { openAuthModal, openSignIn } = useAuthModal()
  const [activeCategory, setActiveCategory] = useState("all")
  const [mediaFilter, setMediaFilter] = useState<"all" | "image" | "video">("all")
  const [categories, setCategories] = useState<Category[]>([])
  const [uploads, setUploads] = useState<Upload[]>([])
  const [filteredUploads, setFilteredUploads] = useState<Upload[]>([])
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())
  const [purchasedItems, setPurchasedItems] = useState<Set<string>>(new Set())
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const [selectedMedia, setSelectedMedia] = useState<Upload | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleCategoryChange = (categorySlug: string) => {
    setActiveCategory(categorySlug)
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

  const handleMediaFilterChange = (filterType: "all" | "image" | "video") => {
    setMediaFilter(filterType)
  }

  useEffect(() => {
    fetchPortfolioData()
    if (session?.user) {
      fetchSavedItems()
      fetchPurchasedItems()
      fetchLikedItems()
    }
  }, [session])

  useEffect(() => {
    filterUploads()
  }, [activeCategory, mediaFilter, uploads])

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

  const fetchSavedItems = async () => {
    try {
      const response = await fetch("/api/client/saved-media")
      if (response.ok) {
        const data = await response.json()
        const savedIds = new Set(data.savedMedia.map((item: any) => item.upload._id))
        setSavedItems(savedIds)
      }
    } catch (error) {
      console.error("Failed to fetch saved items:", error)
    }
  }

  const fetchPurchasedItems = async () => {
    try {
      const response = await fetch("/api/client/my-media")
      if (response.ok) {
        const data = await response.json()
        const purchasedIds = new Set(data.media.map((item: any) => item._id))
        setPurchasedItems(purchasedIds)
      }
    } catch (error) {
      console.error("Failed to fetch purchased items:", error)
    }
  }

  const fetchLikedItems = async () => {
    try {
      const response = await fetch("/api/client/likes")
      if (response.ok) {
        const data = await response.json()
        setLikedItems(new Set(data.likes))
      }
    } catch (error) {
      console.error("Failed to fetch liked items:", error)
    }
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

    if (mediaFilter === "image") {
      filtered = filtered.filter((upload) => upload.fileType.startsWith("image/"))
    } else if (mediaFilter === "video") {
      filtered = filtered.filter((upload) => upload.fileType.startsWith("video/"))
    }

    filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredUploads(filtered)
    setVisibleItems(new Set())
  }

  const handleSave = async (uploadId: string) => {
    if (!session?.user) {
      toast({
        title: "Login required",
        description: "Please login to save media to your collection.",
        variant: "destructive",
      })
      openSignIn()
      return
    }

    try {
      const isSaved = savedItems.has(uploadId)
      const method = isSaved ? "DELETE" : "POST"
      const url = isSaved ? `/api/client/saved-media?uploadId=${uploadId}` : "/api/client/saved-media"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify({ uploadId }) : undefined,
      })

      if (response.ok) {
        if (isSaved) {
          setSavedItems((prev) => {
            const newSet = new Set(prev)
            newSet.delete(uploadId)
            return newSet
          })
          toast({
            title: "Removed from saved",
            description: "Media removed from your saved collection.",
          })
        } else {
          setSavedItems((prev) => new Set(prev).add(uploadId))
          toast({
            title: "Saved successfully",
            description: "Media added to your saved collection.",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save media.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadSD = async (upload: Upload) => {
    if (!session?.user) {
      toast({
        title: "Login required",
        description: "Please login to download media.",
        variant: "destructive",
      })
      openSignIn()
      return
    }

    try {
      const downloadUrl = upload.sdPublicUrl || upload.publicUrl
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `SD-${upload.originalName}`
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Download started",
        description: "SD version download started.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download media.",
        variant: "destructive",
      })
    }
  }

  const handleShare = async (item: Upload) => {
    if (!session?.user) {
      toast({
        title: "Login required",
        description: "Please login to share media.",
        variant: "destructive",
      })
      openSignIn()
      return
    }

    const shareUrl = `${window.location.origin}/portfolio?item=${item._id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title || item.originalName,
          text: item.description || "Check out this amazing photo!",
          url: shareUrl,
        })
        toast({
          title: "Shared successfully",
          description: "Content shared successfully.",
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied",
        description: "Share link copied to clipboard.",
      })
    }
  }

  const handleViewFullscreen = (item: Upload) => {
    setSelectedMedia(item)
    setIsLightboxOpen(true)
  }

  const handleLike = async (uploadId: string) => {
    if (!session?.user) {
      toast({
        title: "Login required",
        description: "Please login to like media.",
        variant: "destructive",
      })
      openSignIn()
      return
    }

    const isLiked = likedItems.has(uploadId)

    try {
      if (isLiked) {
        // Unlike
        const response = await fetch(`/api/client/likes?uploadId=${uploadId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setLikedItems((prev) => {
            const newSet = new Set(prev)
            newSet.delete(uploadId)
            return newSet
          })
          toast({
            title: "Removed from favorites",
            description: "Media removed from your favorites.",
          })
        }
      } else {
        // Like
        const response = await fetch("/api/client/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploadId }),
        })

        if (response.ok) {
          setLikedItems((prev) => new Set(prev).add(uploadId))
          toast({
            title: "Added to favorites",
            description: "Media added to your favorites.",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ParticlesBackground />
        <MainNav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading portfolio...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ParticlesBackground />
      <MainNav />
      <MediaProtection />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="h-3 w-3" />
            Our Work
          </div>
          <h1 className="mb-6 font-serif text-6xl md:text-7xl font-bold text-balance animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
            Our <span className="text-gradient-gold">Portfolio</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            Every frame tells a story. Explore our collection of cinematic captures that transform moments into timeless
            art.
          </p>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {categories.length === 0 && uploads.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Our portfolio is being curated. Check back soon!</p>
            </div>
          ) : (
            <>
              {/* Main Category filters */}
              <div className="mb-12 flex flex-wrap justify-center gap-3">
                <Button
                  variant={activeCategory === "all" ? "default" : "outline"}
                  onClick={() => handleCategoryChange("all")}
                  className={`rounded-full ${activeCategory === "all" ? "gold-glow" : "bg-transparent hover:bg-primary/10"}`}
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
                <div className="mb-8 flex flex-wrap justify-center gap-3">
                  {getSubCategories(activeCategory).map((subCat) => (
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
              )}

              {/* Media Type Filter */}
              <div className="mb-8 flex justify-center gap-2">
                <Button
                  variant={mediaFilter === "all" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleMediaFilterChange("all")}
                >
                  All Media
                </Button>
                <Button
                  variant={mediaFilter === "image" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleMediaFilterChange("image")}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Photos
                </Button>
                <Button
                  variant={mediaFilter === "video" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleMediaFilterChange("video")}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Videos
                </Button>
              </div>

              {/* Grid */}
              {filteredUploads.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No items found in this category.</p>
                </div>
              ) : (
                <div className="space-y-16">
                  {groupUploadsBySubCategory().map((group, groupIndex) => (
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
                                transform: visibleItems.has(itemIndex) ? "translateY(0) scale(1)" : "translateY(50px) scale(0.95)",
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
                              <div className="absolute top-3 left-3 right-3 flex justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-10">
                                <div className="flex gap-2">
                                  {/* Save/Bookmark Button */}
                                  <Button
                                    size="sm"
                                    className="bg-black/80 hover:bg-black text-white backdrop-blur-sm shadow-lg h-9 w-9 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSave(item._id)
                                    }}
                                    title={savedItems.has(item._id) ? "Remove from saved" : "Save to collection"}
                                  >
                                    {savedItems.has(item._id) ? (
                                      <BookmarkCheck className="h-4 w-4 text-primary" />
                                    ) : (
                                      <Bookmark className="h-4 w-4" />
                                    )}
                                  </Button>

                                  {/* Like/Favorite Button */}
                                  <Button
                                    size="sm"
                                    className="bg-black/80 hover:bg-black text-white backdrop-blur-sm shadow-lg h-9 w-9 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleLike(item._id)
                                    }}
                                    title={likedItems.has(item._id) ? "Unlike" : "Like"}
                                  >
                                    <Heart
                                      className={`h-4 w-4 ${likedItems.has(item._id) ? "fill-red-500 text-red-500" : ""}`}
                                    />
                                  </Button>
                                </div>

                                <div className="flex gap-2">
                                  {/* View Fullscreen Button */}
                                  <Button
                                    size="sm"
                                    className="bg-black/80 hover:bg-black text-white backdrop-blur-sm shadow-lg h-9 w-9 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleViewFullscreen(item)
                                    }}
                                    title="View fullscreen"
                                  >
                                    <Maximize2 className="h-4 w-4" />
                                  </Button>

                                  {/* Share Button */}
                                  <Button
                                    size="sm"
                                    className="bg-black/80 hover:bg-black text-white backdrop-blur-sm shadow-lg h-9 w-9 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleShare(item)
                                    }}
                                    title="Share"
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-10">
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation()
                                  }}
                                >
                                  <DownloadModal
                                    uploadId={item._id}
                                    hdPrice={item.hdPrice || 0}
                                    originalName={item.originalName}
                                    isPurchased={purchasedItems.has(item._id)}
                                    sdPublicUrl={item.sdPublicUrl}
                                    publicUrl={item.publicUrl}
                                    onPurchaseComplete={() => {
                                      fetchPurchasedItems()
                                    }}
                                  />
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
            </>
          )}
        </div>
      </section>

      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
          {selectedMedia && (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {selectedMedia.fileType.startsWith("video/") ? (
                <video
                  src={selectedMedia.sdPublicUrl || selectedMedia.publicUrl}
                  controls
                  className="max-w-full max-h-full"
                  autoPlay
                />
              ) : (
                <img
                  src={selectedMedia.sdPublicUrl || selectedMedia.publicUrl}
                  alt={selectedMedia.title || selectedMedia.originalName}
                  className="max-w-full max-h-full object-contain"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                {selectedMedia.title && (
                  <h3 className="text-xl font-semibold text-white mb-2">{selectedMedia.title}</h3>
                )}
                {selectedMedia.description && <p className="text-white/80 mb-3">{selectedMedia.description}</p>}
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{selectedMedia.portfolioCategory.name}</Badge>
                  {selectedMedia.hdPrice && selectedMedia.hdPrice > 0 && (
                    <span className="text-white/90">
                      HD: ₦{Math.round(selectedMedia.hdPrice * 1650).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
