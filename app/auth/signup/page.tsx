"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, Mail, User, Eye, EyeOff, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Turnstile } from "@/components/ui/turnstile"

export default function SignUpPage() {
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const callbackUrl = searchParams.get("callbackUrl") || "/client/dashboard"

  useEffect(() => {
    const handlePopState = () => {
      const navDirection = sessionStorage.getItem("authNavDirection")
      if (navDirection === "toSignin") {
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

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }

  const checkPasswordMatch = (password: string, confirmPassword: string) => {
    if (!confirmPassword) {
      setPasswordMatch(null)
      return
    }
    setPasswordMatch(password === confirmPassword)
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegisterLoading(true)
    setError("")

    if (!validateEmail(registerEmail)) {
      setIsRegisterLoading(false)
      return
    }

    if (registerPassword !== registerConfirmPassword) {
      setError("Passwords do not match")
      setIsRegisterLoading(false)
      return
    }

    if (registerPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsRegisterLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "An error occurred")
        return
      }

      toast({
        title: "Account created!",
        description: "Your account has been created successfully. Signing you in...",
      })

      const result = await signIn("credentials", {
        email: registerEmail,
        password: registerPassword,
        redirect: false,
      })

      if (result?.error) {
        setError("Account created but sign-in failed. Please try signing in manually.")
      } else {
        router.push("/client/dashboard")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsRegisterLoading(false)
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

  const handleSignInClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setIsAnimating(true)

    sessionStorage.setItem("authNavDirection", "toSignin")

    setTimeout(() => {
      router.push("/auth/signin")
    }, 900)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500"
    if (passwordStrength <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak"
    if (passwordStrength <= 3) return "Medium"
    return "Strong"
  }

  return (
    <div className="h-screen w-screen overflow-hidden" style={{ background: "#25252b" }}>
      <div className={`auth-container ${isAnimating ? "" : "active"}`}>
        <div className="curved-shape"></div>
        <div className="curved-shape2"></div>

        <div className="form-box login-form">
          <h2
            className="animation text-[27px] font-bold text-white text-center mb-5"
            style={{ "--D": 0, "--S": 21 } as React.CSSProperties}
          >
            Login
          </h2>
        </div>

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

        <div className="form-box register-form">
          <div className="animation flex justify-center mb-6" style={{ "--li": 16, "--S": -1 } as React.CSSProperties}>
            <h1 className="font-serif text-4xl font-bold text-white">Set Media</h1>
          </div>
          <h2
            className="animation text-[27px] font-bold text-white text-center mb-5"
            style={{ "--li": 17, "--S": 0 } as React.CSSProperties}
          >
            Register
          </h2>
          <form onSubmit={handleRegisterSubmit}>
            {error && (
              <div
                className="animation mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-white text-sm"
                style={{ "--li": 18, "--S": 1 } as React.CSSProperties}
              >
                {error}
              </div>
            )}

            <div className="auth-input-box animation" style={{ "--li": 18, "--S": 1 } as React.CSSProperties}>
              <input
                type="text"
                required
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                disabled={isRegisterLoading}
              />
              <label>Full Name</label>
              <User className="input-icon h-5 w-5" />
            </div>

            <div className="auth-input-box animation" style={{ "--li": 19, "--S": 2 } as React.CSSProperties}>
              <input
                type="email"
                required
                value={registerEmail}
                onChange={(e) => {
                  setRegisterEmail(e.target.value)
                  validateEmail(e.target.value)
                }}
                onBlur={() => validateEmail(registerEmail)}
                disabled={isRegisterLoading}
              />
              <label>Email</label>
              <Mail className="input-icon h-5 w-5" />
              {emailError && <span className="text-red-400 text-xs mt-1 block">{emailError}</span>}
            </div>

            <div className="auth-input-box animation" style={{ "--li": 20, "--S": 3 } as React.CSSProperties}>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={registerPassword}
                onChange={(e) => {
                  setRegisterPassword(e.target.value)
                  calculatePasswordStrength(e.target.value)
                  checkPasswordMatch(e.target.value, registerConfirmPassword)
                }}
                disabled={isRegisterLoading}
              />
              <label>Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="input-icon h-5 w-5 cursor-pointer hover:text-blue-400 transition-colors"
                disabled={isRegisterLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {registerPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i < passwordStrength ? getPasswordStrengthColor() : "bg-gray-600"
                        } transition-all`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    Password strength:{" "}
                    <span className={passwordStrength > 3 ? "text-green-400" : "text-yellow-400"}>
                      {getPasswordStrengthText()}
                    </span>
                  </span>
                </div>
              )}
            </div>

            <div className="auth-input-box animation" style={{ "--li": 21, "--S": 4 } as React.CSSProperties}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={registerConfirmPassword}
                onChange={(e) => {
                  setRegisterConfirmPassword(e.target.value)
                  checkPasswordMatch(registerPassword, e.target.value)
                }}
                disabled={isRegisterLoading}
              />
              <label>Confirm Password</label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="input-icon h-5 w-5 cursor-pointer hover:text-blue-400 transition-colors"
                disabled={isRegisterLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {passwordMatch !== null && (
                <span className="absolute -bottom-5 left-0 text-xs flex items-center gap-1">
                  {passwordMatch ? (
                    <>
                      <Check className="h-3 w-3 text-green-400" />
                      <span className="text-green-400">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 text-red-400" />
                      <span className="text-red-400">Passwords do not match</span>
                    </>
                  )}
                </span>
              )}
            </div>

            <div className="animation mt-6" style={{ "--li": 22, "--S": 5 } as React.CSSProperties}>
              <div className="mb-4 flex justify-center">
                <Turnstile
                  onVerify={setTurnstileToken}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                />
              </div>
            </div>

            <div className="animation" style={{ "--li": 23, "--S": 6 } as React.CSSProperties}>
              <button type="submit" className="auth-btn" disabled={isRegisterLoading || !turnstileToken}>
                {isRegisterLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  "Register"
                )}
              </button>
            </div>

            <div className="animation flex items-center my-4" style={{ "--li": 24, "--S": 7 } as React.CSSProperties}>
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="px-4 text-sm text-gray-400">or</span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>

            <div className="animation" style={{ "--li": 25, "--S": 8 } as React.CSSProperties}>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="auth-btn google-btn"
                disabled={isGoogleLoading || !turnstileToken}
              >
                {isGoogleLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing up...
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

            <div className="animation text-center mt-4" style={{ "--li": 26, "--S": 9 } as React.CSSProperties}>
              <p className="text-xs text-gray-400">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                  Privacy Policy
                </Link>
              </p>
            </div>

            <div className="auth-link animation" style={{ "--li": 27, "--S": 10 } as React.CSSProperties}>
              <p>
                Already have an account? <br />
                <Link href="/auth/signin" onClick={handleSignInClick}>
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>

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
