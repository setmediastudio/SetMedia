"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Calendar, Clock, MapPin, Phone, MessageSquare, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { useToast } from "@/hooks/use-toast"

interface Booking {
  _id: string
  service: string
  preferredDate: string
  preferredTime: string
  location?: string
  contactPhone?: string
  notes?: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export default function MyBookingsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/client/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    })
    await signOut({ callbackUrl: "/" })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    )
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
            <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
            <p className="text-muted-foreground">Track the status of all your session bookings</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No bookings found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all"
                      ? "No bookings match your search criteria."
                      : "You haven't made any bookings yet."}
                  </p>
                </div>
                <Button asChild>
                  <a href="/client/book-a-session">Book a Session</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {booking.service}
                          {getStatusIcon(booking.status)}
                        </CardTitle>
                        <CardDescription>Booked on {new Date(booking.createdAt).toLocaleDateString()}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(booking.preferredDate).toLocaleDateString()}</span>
                        </div>
                        {booking.preferredTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.preferredTime}</span>
                          </div>
                        )}
                        {booking.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.location}</span>
                          </div>
                        )}
                        {booking.contactPhone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.contactPhone}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {booking.notes && (
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium mb-1">
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              Your Notes
                            </div>
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{booking.notes}</p>
                          </div>
                        )}
                        {booking.adminNotes && (
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium mb-1">
                              <MessageSquare className="h-4 w-4 text-primary" />
                              Admin Notes
                            </div>
                            <p className="text-sm text-primary bg-primary/10 p-3 rounded-lg">{booking.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {booking.status === "pending" && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <AlertCircle className="h-4 w-4 inline mr-1" />
                          Your booking is pending confirmation. We'll contact you soon with details.
                        </p>
                      </div>
                    )}
                    {booking.status === "confirmed" && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Your booking has been confirmed! Please arrive on time for your session.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
