import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Open_Sans } from "next/font/google"
import "./globals.css"
import "./auth/auth-animations.css" // Import auth animations CSS globally to prevent FOUC
import { AuthProvider } from "@/components/auth-provider"
import { AuthModalProvider } from "@/lib/auth-modal-context"
import { AuthModal } from "@/components/auth-modal"
import { Toaster } from "@/components/ui/toaster"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Set Media - Capturing Stories Beyond the Frame",
  description: "Luxury cinematic photography and videography studio. Transform moments into timeless stories.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${openSans.variable} dark`}>
      <body className={openSans.className}>
        <AuthProvider>
          <AuthModalProvider>
            {children}
            <AuthModal />
            <Toaster />
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
