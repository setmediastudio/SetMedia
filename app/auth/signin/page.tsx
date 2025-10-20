"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, Mail, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Turnstile } from "@/components/ui/turnstile"

export default function SignInPage() {
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [emailError, setEmailError] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const callbackUrl = searchParams.get("callbackUrl") || "/client/dashboard"

  useEffect(() => {
    const handlePopState = () => {
      const navDirection = sessionStorage.getItem("authNavDirection")
      if (navDirection === "toSignup") {
        setIsAnimating(true)
      }
      sessionStorage.removeItem("authNavDirection")
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError("")
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    setEmailError("")
    return true
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoginLoading(true)
    setError("")

    if (!validateEmail(loginEmail)) {
      setIsLoginLoading(false)
      return
    }

    if (!turnstileToken) {
      setError("Please complete the security verification")
      setIsLoginLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        turnstileToken,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password. Please try again.")
        setTurnstileToken(null)
      } else {
        const session = await getSession()

        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        })

        if (session?.user?.role === "admin") {
          router.push("/admin")
        } else {
          router.push(callbackUrl)
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
      setTurnstileToken(null)
    } finally {
      setIsLoginLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!turnstileToken) {
      toast({
        title: "Security verification required",
        description: "Please complete the security verification first.",
        variant: "destructive",
      })
      return
    }

    setIsGoogleLoading(true)
    try {
      await signIn("google", {
        callbackUrl,
        turnstileToken,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      })
      setTurnstileToken(null)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleSignUpClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setIsAnimating(true)

    sessionStorage.setItem("authNavDirection", "toSignup")

    setTimeout(() => {
      router.push("/auth/signup")
    }, 900)
  }

  return (
    <div className="h-screen w-screen overflow-hidden" style={{ background: "#25252b" }}>
      <div className={`auth-container ${isAnimating ? "active" : ""}`}>
        <div className="curved-shape"></div>
        <div className="curved-shape2"></div>

        {/* Login Form */}
        <div className="form-box login-form">
          <div className="animation flex justify-center mb-6" style={{ "--D": 0, "--S": 20 } as React.CSSProperties}>
            <h1 className="font-serif text-4xl font-bold text-white">Set Media</h1>
          </div>
          <h2
            className="animation text-[27px] font-bold text-white text-center mb-5"
            style={{ "--D": 0, "--S": 21 } as React.CSSProperties}
          >
            Login
          </h2>
          <form onSubmit={handleLoginSubmit}>
            {error && (
              <div
                className="animation mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-white text-sm"
                style={{ "--D": 1, "--S": 22 } as React.CSSProperties}
              >
                {error}
              </div>
            )}

            <div className="auth-input-box animation" style={{ "--D": 1, "--S": 22 } as React.CSSProperties}>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value)
                  validateEmail(e.target.value)
                }}
                onBlur={() => validateEmail(loginEmail)}
                disabled={isLoginLoading}
              />
              <label>Email</label>
              <Mail className="input-icon h-5 w-5" />
              {emailError && <span className="text-red-400 text-xs mt-1 block">{emailError}</span>}
            </div>

            <div className="auth-input-box animation" style={{ "--D": 2, "--S": 23 } as React.CSSProperties}>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={isLoginLoading}
              />
              <label>Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="input-icon h-5 w-5 cursor-pointer hover:text-blue-400 transition-colors"
                disabled={isLoginLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div
              className="animation flex items-center justify-between mt-4"
              style={{ "--D": 3, "--S": 24 } as React.CSSProperties}
            >
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-500 bg-transparent border-2 border-white rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  disabled={isLoginLoading}
                />
                <span className="ml-2 text-sm text-white group-hover:text-blue-400 transition-colors">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <div className="animation mt-6" style={{ "--D": 4, "--S": 25 } as React.CSSProperties}>
              <div className="mb-4 flex justify-center">
                <Turnstile
                  onVerify={setTurnstileToken}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                />
              </div>
            </div>

            <div className="animation" style={{ "--D": 5, "--S": 26 } as React.CSSProperties}>
              <button type="submit" className="auth-btn" disabled={isLoginLoading || !turnstileToken}>
                {isLoginLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </div>

            <div className="animation flex items-center my-4" style={{ "--D": 6, "--S": 27 } as React.CSSProperties}>
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="px-4 text-sm text-gray-400">or</span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>

            <div className="animation" style={{ "--D": 7, "--S": 28 } as React.CSSProperties}>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="auth-btn google-btn"
                disabled={isGoogleLoading || !turnstileToken}
              >
                {isGoogleLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </span>
                )}
              </button>
            </div>

            <div className="auth-link animation" style={{ "--D": 8, "--S": 29 } as React.CSSProperties}>
              <p>
                {"Don't have an account?"} <br />
                <Link href="/auth/signup" onClick={handleSignUpClick}>
                  Sign Up
                </Link>
              </p>
            </div>

            <div className="auth-link animation" style={{ "--D": 9, "--S": 30 } as React.CSSProperties}>
              <Link href="/admin/login" className="text-gray-400 hover:text-white transition-colors">
                Admin Login
              </Link>
            </div>
          </form>
        </div>

        {/* Login Info */}
        <div className="info-content login-info">
          <h2
            className="animation text-[32px] font-bold uppercase leading-tight"
            style={{ "--D": 0, "--S": 20 } as React.CSSProperties}
          >
            WELCOME BACK!
          </h2>
          <p className="animation mt-4 text-base" style={{ "--D": 1, "--S": 21 } as React.CSSProperties}>
            We are happy to have you with us again. If you need anything, we are here to help.
          </p>
        </div>

        {/* Register Form */}
        <div className="form-box register-form">
          <h2
            className="animation text-[27px] font-bold text-white text-center mb-5"
            style={{ "--li": 17, "--S": 0 } as React.CSSProperties}
          >
            Register
          </h2>
        </div>

        {/* Register Info */}
        <div className="info-content register-info">
          <h2
            className="animation text-[32px] font-bold uppercase leading-tight"
            style={{ "--li": 17, "--S": 0 } as React.CSSProperties}
          >
            WELCOME!
          </h2>
          <p className="animation mt-4 text-base" style={{ "--li": 18, "--S": 1 } as React.CSSProperties}>
            {"We're delighted to have you here. If you need any assistance, feel free to reach out."}
          </p>
        </div>
      </div>
    </div>
  )
}
