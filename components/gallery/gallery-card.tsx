"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Eye,
  Lock,
  Download,
  MoreHorizontal,
  ImageIcon,
  Calendar,
  Users,
  Archive,
  Trash2,
  Settings,
} from "lucide-react"
import Link from "next/link"

interface GalleryCardProps {
  gallery: {
    _id: string
    title: string
    description?: string
    isPublic: boolean
    downloadEnabled: boolean
    uploads: any[]
    viewCount: number
    status: string
    createdAt: string
    createdBy?: {
      name: string
      email: string
    }
  }
  onEdit?: (id: string) => void
  onArchive?: (id: string) => void
  onDelete?: (id: string) => void
}

export function GalleryCard({ gallery, onEdit, onArchive, onDelete }: GalleryCardProps) {
  const [imageError, setImageError] = useState(false)
  const coverImage = gallery.uploads?.[0]?.publicUrl

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link href={`/admin/galleries/${gallery._id}`}>
        <div className="relative aspect-video bg-muted overflow-hidden">
          {coverImage && !imageError ? (
            <img
              src={coverImage || "/placeholder.svg"}
              alt={gallery.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            {gallery.isPublic ? (
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                <Eye className="h-3 w-3 mr-1" />
                Public
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                <Lock className="h-3 w-3 mr-1" />
                Private
              </Badge>
            )}
            {gallery.status === "archived" && (
              <Badge variant="secondary" className="bg-orange-500/90 text-white backdrop-blur-sm">
                Archived
              </Badge>
            )}
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <Link href={`/admin/galleries/${gallery._id}`}>
              <h3 className="font-semibold text-lg truncate hover:text-primary transition-colors">{gallery.title}</h3>
            </Link>
            {gallery.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{gallery.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/galleries/${gallery._id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Gallery
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(gallery._id)}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive?.(gallery._id)}>
                <Archive className="h-4 w-4 mr-2" />
                {gallery.status === "archived" ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(gallery._id)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
          <div className="flex items-center gap-1">
            <ImageIcon className="h-4 w-4" />
            <span>{gallery.uploads?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{gallery.viewCount}</span>
          </div>
          {gallery.downloadEnabled && (
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(gallery.createdAt).toLocaleDateString()}
          </div>
          {gallery.createdBy && (
            <div className="text-xs text-muted-foreground truncate max-w-[150px]">{gallery.createdBy.name}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
