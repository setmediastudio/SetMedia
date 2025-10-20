"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileImage, Video, MoreHorizontal, Eye, Download, Trash2, Calendar } from "lucide-react"

interface FileCardProps {
  upload: {
    _id: string
    fileName: string
    originalName: string
    fileSize: number
    fileType: string
    publicUrl: string
    status: string
    createdAt: string
    uploadedBy?: {
      name: string
      email: string
    }
  }
  onView?: (upload: any) => void
  onDownload?: (upload: any) => void
  onDelete?: (id: string) => void
}

export function FileCard({ upload, onView, onDownload, onDelete }: FileCardProps) {
  const [imageError, setImageError] = useState(false)
  const isVideo = upload.fileType.startsWith("video/")
  const isImage = upload.fileType.startsWith("image/")

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  console.log("[v0] FileCard upload data:", {
    id: upload._id,
    fileName: upload.fileName,
    publicUrl: upload.publicUrl,
    fileType: upload.fileType,
  })

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square bg-muted overflow-hidden cursor-pointer" onClick={() => onView?.(upload)}>
        {isImage && !imageError ? (
          <img
            src={upload.publicUrl || "/placeholder.svg"}
            alt={upload.originalName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              console.log("[v0] Image load error:", upload.publicUrl)
              setImageError(true)
            }}
            onLoad={() => {
              console.log("[v0] Image loaded successfully:", upload.publicUrl)
            }}
          />
        ) : isVideo ? (
          <div className="relative w-full h-full">
            <video src={upload.publicUrl} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Video className="h-12 w-12 text-white" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <FileImage className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge
            variant="secondary"
            className={`bg-background/90 backdrop-blur-sm ${
              upload.status === "processed"
                ? "text-green-600"
                : upload.status === "processing"
                  ? "text-orange-600"
                  : "text-red-600"
            }`}
          >
            {upload.status}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate" title={upload.originalName}>
              {upload.originalName}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{formatFileSize(upload.fileSize)}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(upload)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload?.(upload)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(upload._id)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(upload.createdAt).toLocaleDateString()}
          </div>
          {upload.uploadedBy && (
            <div className="text-xs text-muted-foreground truncate max-w-[100px]">{upload.uploadedBy.name}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
