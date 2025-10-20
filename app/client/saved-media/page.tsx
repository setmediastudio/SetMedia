"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bookmark, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface SavedMediaItem {
  _id: string
  upload: {
    _id: string
    fileName: string
    originalName: string
    fileType: string
    sdPublicUrl?: string
    publicUrl: string
    title?: string
    description?: string
    hdPrice?: number
    portfolioCategory?: {
      name: string
      slug: string
    }
  }
  savedAt: string
}

export default function SavedMediaPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [savedMedia, setSavedMedia] = useState<SavedMediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    } else if (status === "authenticated") {
      fetchSavedMedia()
    }
  }, [status, router])

  const fetchSavedMedia = async () => {
    try {
      const response = await fetch("/api/client/saved-media")
      if (response.ok) {
        const data = await response.json()
        setSavedMedia(data.savedMedia)
      }
    } catch (error) {
      console.error("Failed to fetch saved media:", error)
      toast({
        title: "Error",
        description: "Failed to load saved media.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsave = async (uploadId: string) => {
    try {
      const response = await fetch(`/api/client/saved-media?uploadId=${uploadId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Media removed from saved items.",
        })
        fetchSavedMedia()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unsave media.",
        variant: "destructive",
      })
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading saved media...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Saved Media</h1>
          <p className="text-muted-foreground">Your collection of saved images and videos</p>
        </div>

        {savedMedia.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bookmark className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No saved media yet</h3>
              <p className="text-muted-foreground mb-4">Start saving your favorite images and videos</p>
              <Button onClick={() => router.push("/portfolio")}>Browse Portfolio</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedMedia.map((item) => (
              <Card key={item._id} className="group overflow-hidden">
                <div className="relative aspect-square">
                  {item.upload.fileType.startsWith("video/") ? (
                    <video
                      src={item.upload.sdPublicUrl || item.upload.publicUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <Image
                      src={item.upload.sdPublicUrl || item.upload.publicUrl || "/placeholder.svg"}
                      alt={item.upload.title || item.upload.originalName}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleUnsave(item.upload._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  {item.upload.title && <h3 className="font-semibold mb-1 truncate">{item.upload.title}</h3>}
                  {item.upload.portfolioCategory && (
                    <p className="text-xs text-muted-foreground">{item.upload.portfolioCategory.name}</p>
                  )}
                  {item.upload.hdPrice && item.upload.hdPrice > 0 && (
                    <p className="text-sm font-medium text-primary mt-2">HD: ${item.upload.hdPrice.toFixed(2)}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
