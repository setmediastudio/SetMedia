"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Lock } from "lucide-react"
import { useSession } from "next-auth/react"
import { useAuthModal } from "@/lib/auth-modal-context"

interface PaymentButtonProps {
  amount: number
  itemType: "gallery" | "upload" | "album"
  itemId: string
  itemName: string
  onSuccess?: () => void
  className?: string
}

export function PaymentButton({ amount, itemType, itemId, itemName, onSuccess, className }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()
  const { openSignIn } = useAuthModal()

  const handlePayment = async () => {
    if (!session) {
      openSignIn()
      return
    }

    setIsLoading(true)

    try {
      // Initialize payment
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          itemType,
          itemId,
          metadata: {
            itemName,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment")
      }

      // Redirect to Paystack payment page
      if (data.payment.authorizationUrl) {
        window.location.href = data.payment.authorizationUrl
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handlePayment} disabled={isLoading} className={className}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Lock className="mr-2 h-4 w-4" />
          Unlock for ₦{amount.toLocaleString()}
        </>
      )}
    </Button>
  )
}
