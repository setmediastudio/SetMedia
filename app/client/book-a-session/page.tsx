"use client"

import type React from "react"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, User, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { CameraLoading } from "@/components/camera-loading"

export default function BookSessionPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    service: "",
    preferredDate: "",
    preferredTime: "",
    location: "",
    notes: "",
    contactPhone: "",
  })

  const handleSignOut = async () => {
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    })
    await signOut({ callbackUrl: "/" })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/client/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Booking submitted!",
          description: "We'll contact you soon to confirm your session details.",
        })

        // Reset form
        setFormData({
          service: "",
          preferredDate: "",
          preferredTime: "",
          location: "",
          notes: "",
          contactPhone: "",
        })
      } else {
        throw new Error("Failed to submit booking")
      }
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "There was an error submitting your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return <CameraLoading />
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        user={{
          name: session.user?.name,
          email: session.user?.email,
          image: session.user?.image,
          role: session.user?.role || "client",
        }}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={{
            name: session.user?.name,
            email: session.user?.email,
            image: session.user?.image,
            role: session.user?.role || "client",
          }}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 overflow-auto bg-muted/30 p-6 space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Book a Session</h1>
            <p className="text-muted-foreground">Schedule your photography session with our professional team</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>Session Details</span>
                  </CardTitle>
                  <CardDescription>Fill out the form below to request a photography session</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Service Type */}
                    <div className="space-y-2">
                      <Label htmlFor="service">Service Type *</Label>
                      <Select value={formData.service} onValueChange={(value) => handleInputChange("service", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portrait">Portrait Session</SelectItem>
                          <SelectItem value="wedding">Wedding Photography</SelectItem>
                          <SelectItem value="event">Event Photography</SelectItem>
                          <SelectItem value="family">Family Photos</SelectItem>
                          <SelectItem value="corporate">Corporate Headshots</SelectItem>
                          <SelectItem value="product">Product Photography</SelectItem>
                          <SelectItem value="other">Other (specify in notes)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date and Time */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preferred-date">Preferred Date *</Label>
                        <Input
                          id="preferred-date"
                          type="date"
                          value={formData.preferredDate}
                          onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferred-time">Preferred Time</Label>
                        <Select
                          value={formData.preferredTime}
                          onValueChange={(value) => handleInputChange("preferredTime", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                            <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                            <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Contact and Location */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-phone">Contact Phone</Label>
                        <Input
                          id="contact-phone"
                          type="tel"
                          placeholder="Your phone number"
                          value={formData.contactPhone}
                          onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Preferred Location</Label>
                        <Input
                          id="location"
                          placeholder="Studio, outdoor, your location, etc."
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Tell us more about your vision, special requirements, or any questions you have..."
                        rows={4}
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting || !formData.service || !formData.preferredDate}>
                        {isSubmitting ? "Submitting..." : "Submit Booking Request"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Services Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5 text-primary" />
                    <span>Our Services</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Portrait Sessions</h4>
                      <p className="text-sm text-muted-foreground">Professional headshots and personal portraits</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Wedding Photography</h4>
                      <p className="text-sm text-muted-foreground">Complete wedding day coverage</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Event Photography</h4>
                      <p className="text-sm text-muted-foreground">Corporate events, parties, and celebrations</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Family Photos</h4>
                      <p className="text-sm text-muted-foreground">Capturing precious family moments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-primary" />
                    <span>Contact Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Response within 24 hours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Studio & on-location available</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    We'll review your request and contact you to discuss details and confirm availability.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
