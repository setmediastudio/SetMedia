"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Loader2, Lock } from "lucide-react"
import { PaymentButton } from "./payment-button"

interface SecureImageProps {
  uploadId: string
  alt: string
  className?: string
  isPaid?: boolean
  price?: number
  itemName?: string
  hasAccess?: boolean
}

export function SecureImage({ uploadId, alt, className, isPaid, price, itemName, hasAccess }: SecureImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requiresPayment, setRequiresPayment] = useState(false)

  useEffect(() => {
    loadImage()
  }, [uploadId, hasAccess])

  const loadImage = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/download/${uploadId}`)
      const data = await response.json()

      if (response.ok) {
        setImageUrl(data.downloadUrl)
        setError(null)
      } else {
        if (data.requiresPayment) {
          setRequiresPayment(true)
          setError("Payment required to view this image")
        } else {
          setError(data.error || "Failed to load image")
        }
      }
    } catch (err) {
      setError("Failed to load image")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (requiresPayment && isPaid && price) {
    return (
      <div className={`flex flex-col items-center justify-center bg-muted p-8 ${className}`}>
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-4 text-center">This content requires payment to access</p>
        <PaymentButton
          amount={price}
          itemType="upload"
          itemId={uploadId}
          itemName={itemName || "Image"}
          onSuccess={loadImage}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <p className="text-sm text-muted-foreground">Image not available</p>
      </div>
    )
  }

  return <Image src={imageUrl || "/placeholder.svg"} alt={alt} fill className={className} />
}
