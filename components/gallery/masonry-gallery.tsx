"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, X, ChevronLeft, ChevronRight, Play } from "lucide-react"
import { getMasonryClass } from "@/utils/getMasonryClass" // Assuming getMasonryClass is a utility function

interface MasonryGalleryProps {
  items: Array<{
    _id: string
    publicUrl: string
    originalName: string
    fileType: string
    fileSize: number
  }>
  layout?: "masonry" | "grid"
  allowDownload?: boolean
}

export function MasonryGallery({ items, layout = "masonry", allowDownload = true }: MasonryGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const photos = items.filter((item) => item.fileType.startsWith("image/"))
  const videos = items.filter((item) => item.fileType.startsWith("video/"))

  const handleImageError = (id: string) => {
    setImageErrors((prev) => new Set(prev).add(id))
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const renderGallerySection = (title: string, items: typeof photos, startIndex: number) => {
    if (items.length === 0) return null

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
          {items.map((item, idx) => {
            const globalIndex = startIndex + idx
            const isVideo = item.fileType.startsWith("video/")
            const hasError = imageErrors.has(item._id)

            return (
              <div
                key={item._id}
                className="group relative overflow-hidden rounded-lg bg-muted cursor-pointer transition-all duration-300 will-change-transform"
                onClick={() => setSelectedIndex(globalIndex)}
                style={{
                  aspectRatio: "1/1",
                  transform: "translate3d(0, 0, 0)",
                  WebkitTransform: "translate3d(0, 0, 0)",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  WebkitBackfaceVisibility: "hidden",
                }}
                onMouseEnter={(e) => {
                  const element = e.currentTarget as HTMLElement
                  element.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.4)"
                  element.style.transform = "translate3d(0, 0, 0) scale(1.02)"
                  element.style.WebkitTransform = "translate3d(0, 0, 0) scale(1.02)"
                }}
                onMouseLeave={(e) => {
                  const element = e.currentTarget as HTMLElement
                  element.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)"
                  element.style.transform = "translate3d(0, 0, 0) scale(1)"
                  element.style.WebkitTransform = "translate3d(0, 0, 0) scale(1)"
                }}
              >
                {isVideo ? (
                  <div className="relative w-full h-full" style={{ transform: "translate3d(0, 0, 0)" }}>
                    <video src={item.publicUrl} className="w-full h-full object-cover" style={{ transform: "translate3d(0, 0, 0)" }} />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                ) : hasError ? (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-muted-foreground text-sm">Failed to load</span>
                  </div>
                ) : (
                  <img
                    src={item.publicUrl || "/placeholder.svg"}
                    alt={item.originalName}
                    className="w-full h-full object-cover transition-transform duration-300 will-change-transform"
                    style={{ transform: "translate3d(0, 0, 0)", WebkitTransform: "translate3d(0, 0, 0)" }}
                    onError={() => handleImageError(item._id)}
                    onMouseEnter={(e) => {
                      const img = e.currentTarget as HTMLImageElement
                      img.style.transform = "translate3d(0, 0, 0) scale(1.1)"
                      img.style.WebkitTransform = "translate3d(0, 0, 0) scale(1.1)"
                    }}
                    onMouseLeave={(e) => {
                      const img = e.currentTarget as HTMLImageElement
                      img.style.transform = "translate3d(0, 0, 0)"
                      img.style.WebkitTransform = "translate3d(0, 0, 0)"
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 ease-out pointer-events-none" style={{ WebkitTransition: "opacity 0.3s ease-out", WebkitBackfaceVisibility: "hidden" }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "1" }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "0" }}>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium truncate">{item.originalName}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const allItems = [...photos, ...videos]
  const selectedItem = selectedIndex !== null ? allItems[selectedIndex] : null

  return (
    <>
      <div className="space-y-8">
        {renderGallerySection("Photos", photos, 0)}
        {renderGallerySection("Videos", videos, photos.length)}
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
          {selectedItem && (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={() => setSelectedIndex(null)}
              >
                <X className="h-6 w-6" />
              </Button>

              {selectedIndex !== null && selectedIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={() => setSelectedIndex(selectedIndex - 1)}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              )}

              {selectedIndex !== null && selectedIndex < allItems.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={() => setSelectedIndex(selectedIndex + 1)}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              )}

              <div className="w-full h-full flex items-center justify-center p-4">
                {selectedItem.fileType.startsWith("video/") ? (
                  <video src={selectedItem.publicUrl} controls className="max-w-full max-h-full" />
                ) : (
                  <img
                    src={selectedItem.publicUrl || "/placeholder.svg"}
                    alt={selectedItem.originalName}
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>

              {allowDownload && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-4 right-4 z-10"
                  onClick={() => handleDownload(selectedItem.publicUrl, selectedItem.originalName)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}

              <div className="absolute bottom-4 left-4 z-10 text-white">
                <p className="text-sm font-medium">{selectedItem.originalName}</p>
                <p className="text-xs text-white/70">
                  {selectedIndex + 1} of {allItems.length}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
