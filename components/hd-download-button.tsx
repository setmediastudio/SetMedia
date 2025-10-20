"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Download, Lock } from "lucide-react"
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

interface HDDownloadButtonProps {
  uploadId: string
  hdPrice: number
  originalName: string
  isPurchased?: boolean
  onPurchaseComplete?: () => void
}

export function HDDownloadButton({
  uploadId,
  hdPrice,
  originalName,
  isPurchased = false,
  onPurchaseComplete,
}: HDDownloadButtonProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { openAuthModal } = useAuthModal()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleClick = () => {
    if (!session?.user) {
      openAuthModal()
      return
    }

    if (isPurchased || hdPrice === 0) {
      handleDownloadHD()
    } else {
      setIsDialogOpen(true)
    }
  }

  const handleDownloadHD = async () => {
    try {
      const response = await fetch(`/api/download/${uploadId}`)
      if (response.ok) {
        const data = await response.json()
        window.open(data.downloadUrl, "_blank")
        toast({
          title: "Download started",
          description: "HD version download started.",
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

  const handlePurchase = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId,
          amount: hdPrice,
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

  if (isPurchased) {
    return (
      <Button
        size="sm"
        variant="secondary"
        className="bg-green-600 hover:bg-green-700 text-white"
        onClick={handleClick}
      >
        <Download className="h-4 w-4 mr-1" />
        Download HD
      </Button>
    )
  }

  if (hdPrice === 0) {
    return (
      <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white" onClick={handleClick}>
        <Download className="h-4 w-4 mr-1" />
        HD Free
      </Button>
    )
  }

  return (
    <>
      <Button size="sm" variant="secondary" className="bg-primary hover:bg-primary/90 text-white" onClick={handleClick}>
        <Lock className="h-4 w-4 mr-1" />
        HD ${hdPrice.toFixed(2)}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase HD Version</DialogTitle>
            <DialogDescription>Get lifetime access to the high-definition version of this media.</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground mb-2">File:</p>
              <p className="font-medium mb-4">{originalName}</p>
              <p className="text-sm text-muted-foreground mb-2">Price:</p>
              <p className="text-2xl font-bold text-primary">${hdPrice.toFixed(2)}</p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Full HD quality</p>
              <p>✓ Lifetime access</p>
              <p>✓ Download anytime from "My Media"</p>
              <p>✓ Secure payment via Paystack</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Purchase Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
