"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Turnstile } from "@/components/ui/turnstile"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!turnstileToken) {
      setError("Please complete the security verification")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("admin-credentials", {
        email,
        password,
        turnstileToken,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid admin credentials")
        setTurnstileToken(null)
      } else {
        toast({
          title: "Admin access granted",
          description: "Welcome to the admin dashboard.",
        })

        router.push("/admin/dashboard")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
      setTurnstileToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-red-600" />
            <span className="text-2xl font-bold text-red-600">Admin Access</span>
          </div>
          <CardTitle>Administrator Login</CardTitle>
          <CardDescription>Restricted access for authorized personnel only</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Security Verification</Label>
              <Turnstile
                onVerify={setTurnstileToken}
                onError={() => setTurnstileToken(null)}
                onExpire={() => setTurnstileToken(null)}
                className="flex justify-center"
                theme="light"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading || !turnstileToken}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Access Admin Panel"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <Link href="/auth/signin" className="text-muted-foreground hover:underline">
              ← Back to User Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
