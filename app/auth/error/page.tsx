"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration."
      case "AccessDenied":
        return "You do not have permission to sign in."
      case "Verification":
        return "The verification token has expired or has already been used."
      case "CredentialsSignin":
        return "Invalid email or password. Please check your credentials and try again."
      case "TurnstileVerification":
        return "Security verification failed. Please complete the security check and try again."
      case "SecurityVerificationFailed":
        return "Security verification could not be completed. Please refresh the page and try again."
      default:
        return "An error occurred during authentication."
    }
  }

  const getErrorDetails = (error: string | null) => {
    switch (error) {
      case "TurnstileVerification":
      case "SecurityVerificationFailed":
        return "If you continue to experience issues with security verification, please ensure JavaScript is enabled and try refreshing the page."
      case "CredentialsSignin":
        return "Make sure you're using the correct email and password. If you forgot your password, please contact support."
      default:
        return "Please try signing in again or contact support if the problem persists."
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>{getErrorMessage(error)}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">{getErrorDetails(error)}</p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/signin">Try Again</Link>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
