"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useState } from "react"

interface Album {
  id: string
  title: string
  coverImage?: string
  status: "finalized" | "pending" | "processing"
  createdAt: Date
  clientName?: string
}

interface RecentlyViewedAlbumsProps {
  albums: Album[]
  className?: string
  title?: string
}

interface AlbumStatusSectionProps {
  finalizedAlbums: Album[]
  pendingAlbums: Album[]
  className?: string
  finalizedLabel?: string
  pendingLabel?: string
}

export function RecentlyViewedAlbums({
  albums,
  className,
  title = "Recently Viewed Albums",
}: RecentlyViewedAlbumsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {albums.slice(0, 3).map((album) => (
            <div key={album.id} className="group cursor-pointer">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-2">
                {album.coverImage ? (
                  <Image
                    src={album.coverImage || "/placeholder.svg"}
                    alt={album.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">No Preview</span>
                  </div>
                )}
              </div>
              <div className="text-sm font-medium text-foreground truncate">{album.title}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function AlbumStatusSection({
  finalizedAlbums,
  pendingAlbums,
  className,
  finalizedLabel = "Finalized",
  pendingLabel = "Pending",
}: AlbumStatusSectionProps) {
  const [activeTab, setActiveTab] = useState<"finalized" | "pending">("finalized")

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours} Days ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} Days ago`
    }
  }

  const displayAlbums = activeTab === "finalized" ? finalizedAlbums : pendingAlbums

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("finalized")}
            className={`flex-1 p-4 text-center font-medium rounded-tl-lg transition-colors ${
              activeTab === "finalized"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {finalizedLabel} ({finalizedAlbums.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 p-4 text-center font-medium rounded-tr-lg transition-colors ${
              activeTab === "pending"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {pendingLabel} ({pendingAlbums.length})
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          {displayAlbums.length > 0 ? (
            displayAlbums.map((album) => (
              <div
                key={album.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {album.coverImage ? (
                    <Image
                      src={album.coverImage || "/placeholder.svg"}
                      alt={album.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">{album.title}</div>
                  <div className="text-xs text-muted-foreground">{album.clientName || "Unknown Client"}</div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant={album.status === "finalized" ? "default" : "secondary"} className="text-xs">
                    {album.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground flex-shrink-0">{formatTimeAgo(album.createdAt)}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No {activeTab} albums found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
