"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Download, Lock, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuthModal } from "@/lib/auth-modal-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface DownloadModalProps {
  uploadId: string
  hdPrice: number
  originalName: string
  isPurchased?: boolean
  sdPublicUrl?: string
  publicUrl: string
  onPurchaseComplete?: () => void
}

export function DownloadModal({
  uploadId,
  hdPrice,
  originalName,
  isPurchased = false,
  sdPublicUrl,
  publicUrl,
  onPurchaseComplete,
}: DownloadModalProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { openAuthModal, openSignIn } = useAuthModal()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState<"sd" | "hd" | null>(null)

  const handleOpenModal = () => {
    if (!session?.user) {
      toast({
        title: "Login required",
        description: "Please login to download media.",
        variant: "destructive",
      })
      openSignIn()
      return
    }
    setIsDialogOpen(true)
  }

  const downloadFile = async (url: string, filename: string) => {
    try {
      console.log("[v0] Downloading from URL:", url)

      // Use a proxy approach to avoid CORS issues
      const response = await fetch(`/api/proxy-download?url=${encodeURIComponent(url)}`)

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`)
      }

      const blob = await response.blob()
      console.log("[v0] Blob created, size:", blob.size)

      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = filename
      link.style.display = "none"
      document.body.appendChild(link)
      link.click()

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      }, 100)

      return true
    } catch (error) {
      console.error("[v0] Download error:", error)
      throw error
    }
  }

  const handleDownloadSD = async () => {
    try {
      setIsProcessing(true)
      const downloadUrl = sdPublicUrl || publicUrl

      await downloadFile(downloadUrl, `SD-${originalName}`)

      toast({
        title: "Download started",
        description: "SD version download started.",
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("[v0] SD download error:", error)
      toast({
        title: "Error",
        description: "Failed to download media. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadHD = async () => {
    if (isPurchased || hdPrice === 0) {
      try {
        setIsProcessing(true)

        await downloadFile(publicUrl, `HD-${originalName}`)

        toast({
          title: "Download started",
          description: "HD version download started.",
        })
        setIsDialogOpen(false)
      } catch (error) {
        console.error("[v0] HD download error:", error)
        toast({
          title: "Error",
          description: "Failed to download media. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsProcessing(false)
      }
    } else {
      handlePurchase()
    }
  }

  const handlePurchase = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId,
          amount: hdPrice,
          currency: "NGN",
          type: "hd_download",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = data.authorization_url
      } else {
        const error = await response.json()
        toast({
          title: "Payment Error",
          description: error.error || "Failed to initialize payment.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Button
        size="sm"
        className="bg-black/80 hover:bg-black text-white backdrop-blur-sm shadow-lg"
        onClick={handleOpenModal}
      >
        <Download className="h-4 w-4 mr-1" />
        Download
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Download Quality</DialogTitle>
            <DialogDescription>Select the quality you want to download</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {/* SD Option */}
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedQuality === "sd" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedQuality("sd")}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    SD Quality
                    <Badge variant="secondary" className="bg-green-600 text-white">
                      FREE
                    </Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Standard Definition</p>
                </div>
                {selectedQuality === "sd" && <Check className="h-5 w-5 text-primary" />}
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 mt-3">
                <li>✓ Good for social media</li>
                <li>✓ Smaller file size</li>
                <li>✓ Instant download</li>
              </ul>
            </div>

            {/* HD Option */}
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedQuality === "hd" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedQuality("hd")}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    HD Quality
                    {isPurchased ? (
                      <Badge variant="secondary" className="bg-green-600 text-white">
                        OWNED
                      </Badge>
                    ) : hdPrice === 0 ? (
                      <Badge variant="secondary" className="bg-green-600 text-white">
                        FREE
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-primary text-white">
                        <Lock className="h-3 w-3 mr-1" />₦{hdPrice.toLocaleString()}
                      </Badge>
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">High Definition</p>
                </div>
                {selectedQuality === "hd" && <Check className="h-5 w-5 text-primary" />}
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 mt-3">
                <li>✓ Full resolution</li>
                <li>✓ Professional quality</li>
                <li>✓ Lifetime access</li>
                <li>✓ Download anytime from "My Media"</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedQuality === "sd") {
                  handleDownloadSD()
                } else if (selectedQuality === "hd") {
                  handleDownloadHD()
                }
              }}
              disabled={!selectedQuality || isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing
                ? "Processing..."
                : selectedQuality === "hd" && !isPurchased && hdPrice > 0
                  ? `Pay ₦${hdPrice.toLocaleString()} & Download`
                  : "Download"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
