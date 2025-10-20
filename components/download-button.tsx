"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useAuthModal } from "@/lib/auth-modal-context"

interface DownloadButtonProps {
  uploadId?: string
  galleryId?: string
  fileName?: string
  className?: string
}

export function DownloadButton({ uploadId, galleryId, fileName, className }: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()
  const { openSignIn } = useAuthModal()

  const handleDownload = async () => {
    if (!session) {
      openSignIn()
      return
    }

    setIsLoading(true)

    try {
      const endpoint = uploadId ? `/api/download/${uploadId}` : `/api/gallery/${galleryId}/download`

      const response = await fetch(endpoint)
      const data = await response.json()

      if (!response.ok) {
        if (data.requiresPayment) {
          toast({
            title: "Payment Required",
            description: `This content costs ₦${data.price}. Please purchase to download.`,
            variant: "destructive",
          })
        } else {
          throw new Error(data.error || "Download failed")
        }
        return
      }

      if (uploadId) {
        // Single file download
        const link = document.createElement("a")
        link.href = data.downloadUrl
        link.download = fileName || data.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: "Download Started",
          description: "Your file is being downloaded",
        })
      } else {
        // Gallery download - download all files
        for (const file of data.downloads) {
          const link = document.createElement("a")
          link.href = file.downloadUrl
          link.download = file.fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          await new Promise((resolve) => setTimeout(resolve, 500)) // Delay between downloads
        }

        toast({
          title: "Downloads Started",
          description: `Downloading ${data.downloads.length} files from ${data.galleryTitle}`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download file",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={isLoading} className={className}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download
        </>
      )}
    </Button>
  )
}
