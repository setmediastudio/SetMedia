"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, ShoppingBag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface MediaItem {
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

export default function MyMediaPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [media, setMedia] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    } else if (status === "authenticated") {
      fetchMyMedia()
    }
  }, [status, router])

  const fetchMyMedia = async () => {
    try {
      const response = await fetch("/api/client/my-media")
      if (response.ok) {
        const data = await response.json()
        setMedia(data.media)
      }
    } catch (error) {
      console.error("Failed to fetch my media:", error)
      toast({
        title: "Error",
        description: "Failed to load purchased media.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadHD = async (mediaItem: MediaItem) => {
    try {
      const response = await fetch(`/api/download/${mediaItem._id}`)
      if (response.ok) {
        const data = await response.json()
        window.open(data.downloadUrl, "_blank")
        toast({
          title: "Success",
          description: "HD download started.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to generate download link.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download media.",
        variant: "destructive",
      })
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading your media...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Media</h1>
          <p className="text-muted-foreground">Your purchased HD images and videos</p>
        </div>

        {media.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No purchased media yet</h3>
              <p className="text-muted-foreground mb-4">Purchase HD versions to download anytime</p>
              <Button onClick={() => router.push("/portfolio")}>Browse Portfolio</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {media.map((item) => (
              <Card key={item._id} className="group overflow-hidden">
                <div className="relative aspect-square">
                  {item.fileType.startsWith("video/") ? (
                    <video
                      src={item.sdPublicUrl || item.publicUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <Image
                      src={item.sdPublicUrl || item.publicUrl || "/placeholder.svg"}
                      alt={item.title || item.originalName}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleDownloadHD(item)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download HD
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  {item.title && <h3 className="font-semibold mb-1 truncate">{item.title}</h3>}
                  {item.portfolioCategory && (
                    <p className="text-xs text-muted-foreground">{item.portfolioCategory.name}</p>
                  )}
                  <p className="text-xs text-green-600 mt-2">Purchased - Download Anytime</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
