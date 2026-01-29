"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const reference = searchParams.get("reference")

    if (!reference) {
      setStatus("error")
      setMessage("No payment reference provided")
      return
    }

    verifyPayment(reference)
  }, [searchParams])

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch(`/api/payment/verify?reference=${reference}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setStatus("success")
        setMessage("Payment verified successfully! You now have access to the content.")
      } else {
        setStatus("error")
        setMessage(data.error || "Payment verification failed")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Failed to verify payment. Please contact support.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
            {status === "success" && <CheckCircle2 className="h-16 w-16 text-green-500" />}
            {status === "error" && <XCircle className="h-16 w-16 text-red-500" />}
          </div>
          <CardTitle className="text-2xl font-serif">
            {status === "loading" && "Verifying Payment"}
            {status === "success" && "Payment Successful"}
            {status === "error" && "Payment Failed"}
          </CardTitle>
          <CardDescription>{message || "Please wait while we verify your payment..."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && (
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/client/galleries">View My Galleries</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>
          )}
          {status === "error" && (
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
