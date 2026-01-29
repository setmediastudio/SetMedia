"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface AuthModalContextType {
  isOpen: boolean
  mode: "signin" | "signup"
  openSignIn: () => void
  openSignUp: () => void
  close: () => void
  returnUrl?: string
  setReturnUrl: (url: string) => void
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [returnUrl, setReturnUrl] = useState<string | undefined>(undefined)

  const openSignIn = () => {
    setMode("signin")
    setIsOpen(true)
  }

  const openSignUp = () => {
    setMode("signup")
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
  }

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        mode,
        openSignIn,
        openSignUp,
        close,
        returnUrl,
        setReturnUrl,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider")
  }
  return context
}
