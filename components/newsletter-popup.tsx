"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle2, Sparkles, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("newsletter-popup-seen")
    const hasSubscribed = localStorage.getItem("newsletter-subscribed")

    if (!hasSeenPopup && !hasSubscribed) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem("newsletter-popup-seen", "true")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        localStorage.setItem("newsletter-subscribed", "true")
        localStorage.setItem("newsletter-email", email)
        setIsSubscribed(true)

        toast({
          title: "Welcome to the family!",
          description: "Check your inbox for a welcome message from Set Media.",
        })
      } else {
        throw new Error(data.error || "Subscription failed")
      }
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-primary/20 bg-card">
        {!isSubscribed ? (
          <>
            <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 pb-12">
              <div className="absolute top-4 right-4 opacity-20">
                <Camera className="h-24 w-24 text-primary" />
              </div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                  <Sparkles className="h-3 w-3" />
                  Exclusive Updates
                </div>
                <h2 className="font-serif text-3xl font-bold mb-2">
                  Join Our <span className="text-gradient-gold">Creative</span> Community
                </h2>
                <p className="text-muted-foreground">
                  Get exclusive photography tips, behind-the-scenes content, and special offers delivered to your inbox.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 -mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-muted/50 border-border"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-12 gold-glow text-base" disabled={isSubmitting}>
                  {isSubmitting ? "Subscribing..." : "Subscribe Now"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
                </p>
              </form>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="mb-6 mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-bold mb-3">
              Welcome to the <span className="text-gradient-gold">Family!</span>
            </h2>
            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
              Thank you for subscribing to Set Media's newsletter!
            </p>

            {/* Confirmation message about email */}
            <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Check Your Inbox</span>
              </div>
              <p className="text-sm text-muted-foreground">
                We've sent a welcome message to <span className="text-primary font-medium">{email}</span>. You'll now
                receive our latest updates, exclusive offers, and photography tips.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Exclusive behind-the-scenes content</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Early access to special promotions</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Professional photography tips</span>
              </div>
            </div>
            <Button onClick={handleClose} className="gold-glow">
              Start Exploring
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
