"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Video, Bookmark, BookmarkCheck, Maximize2, Share2, Heart } from "lucide-react"
import { MediaProtection } from "@/components/media-protection"
import { ProtectedMedia } from "@/components/protected-media"
import { DownloadModal } from "@/components/download-modal"
import { useToast } from "@/hooks/use-toast"
import { useAuthModal } from "@/lib/auth-modal-context"
import { Dialog, DialogContent } from "@/components/ui/dialog"

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
  sdPublicUrl?: string
  title?: string
  description?: string
  hdPrice?: number
  portfolioCategory: {
    _id: string
    name: string
    slug: string
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

  const filterUploads = () => {
    let filtered = uploads

    if (activeCategory !== "all") {
      filtered = filtered.filter((upload) => upload.portfolioCategory?.slug === activeCategory)
    }

    if (mediaFilter === "image") {
      filtered = filtered.filter((upload) => upload.fileType.startsWith("image/"))
    } else if (mediaFilter === "video") {
      filtered = filtered.filter((upload) => upload.fileType.startsWith("video/"))
    }

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
        <MainNav />
        <MediaProtection />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <MediaProtection />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container mx-auto text-center">
          <h1 className="mb-6 font-serif text-6xl md:text-7xl font-bold text-balance animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Our Portfolio
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
              <h3 className="text-2xl font-semibold mb-4">Portfolio Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Our portfolio is being curated. Check back soon to see our latest work.
              </p>
            </div>
          ) : (
            <>
              {/* Category Filters */}
              <div className="mb-8 flex flex-wrap justify-center gap-4">
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

              {/* Media Type Filter */}
              {activeCategory !== "all" && (
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
              )}

              {/* Masonry Grid */}
              {filteredUploads.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No items found in this category.</p>
                </div>
              ) : (
                <div className="columns-1 gap-4 sm:gap-6 md:columns-2 lg:columns-3 xl:columns-4">
                  {filteredUploads.map((item, index) => (
                    <div
                      key={item._id}
                      ref={(el) => {
                        itemRefs.current[index] = el
                      }}
                      className="group relative mb-4 sm:mb-6 break-inside-avoid overflow-hidden rounded-lg cursor-pointer transition-all duration-700"
                      style={{
                        opacity: visibleItems.has(index) ? 1 : 0,
                        transform: visibleItems.has(index) ? "translateY(0) scale(1)" : "translateY(50px) scale(0.95)",
                      }}
                    >
                      <ProtectedMedia
                        src={item.sdPublicUrl || item.publicUrl || "/placeholder.svg"}
                        alt={item.title || item.originalName}
                        type={item.fileType.startsWith("video/") ? "video" : "image"}
                        className="w-full"
                      />

                      {item.fileType.startsWith("video/") && (
                        <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                          <Video className="h-3 w-3 mr-1" />
                          Video
                        </Badge>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
                        <div className="absolute bottom-4 left-4 right-4">
                          {item.title && <p className="text-lg font-semibold text-white mb-1">{item.title}</p>}
                          {item.description && (
                            <p className="text-sm text-white/80 mb-2 line-clamp-2">{item.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="inline-block text-xs text-primary font-medium">
                              {item.portfolioCategory.name}
                            </span>
                            {item.hdPrice && item.hdPrice > 0 && (
                              <p className="text-sm text-white/90 font-semibold">
                                HD: ₦{item.hdPrice.toLocaleString()}
                              </p>
                            )}
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

                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-10">
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
