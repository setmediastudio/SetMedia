"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Users, Search, Eye, Upload, Calendar, ShoppingBag, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

interface Client {
  _id: string
  name: string
  email: string
  role: string
  provider: string
  createdAt: string
  image?: string
  stats: {
    uploads: number
    bookings: number
    orders: number
  }
}

export default function AdminClientsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [searchTerm])

  const fetchClients = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setClients(data.users)
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error)
      toast({
        title: "Error",
        description: "Failed to load clients.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    toast({
      title: "Admin signed out",
      description: "You have been signed out of the admin panel.",
    })
    await signOut({ callbackUrl: "/" })
  }

  if (!session || session.user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
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
          role: session.user?.role,
        }}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={{
            name: session.user?.name,
            email: session.user?.email,
            image: session.user?.image,
            role: session.user?.role,
          }}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 overflow-auto bg-muted/30 p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Client Management</h1>
              <p className="text-muted-foreground">View and manage registered clients and their activity.</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                    <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : clients.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email Signup</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? "..." : clients.filter((c) => c.provider === "credentials").length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Google Signup</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? "..." : clients.filter((c) => c.provider === "google").length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading
                        ? "..."
                        : clients.filter((c) => {
                            const monthAgo = new Date()
                            monthAgo.setMonth(monthAgo.getMonth() - 1)
                            return new Date(c.createdAt) > monthAgo
                          }).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Clients Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Clients</CardTitle>
              <CardDescription>Registered users and their activity overview</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading clients...</p>
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No clients found.</p>
                  <p className="text-sm">Registered users will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Uploads</TableHead>
                        <TableHead>Bookings</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client._id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={client.image || ""} />
                                <AvatarFallback>{client.name.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{client.name}</p>
                                <p className="text-xs text-muted-foreground">{client.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {client.provider}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Upload className="h-4 w-4 text-blue-600" />
                              <span className="text-sm">{client.stats?.uploads || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{client.stats?.bookings || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <ShoppingBag className="h-4 w-4 text-purple-600" />
                              <span className="text-sm">{client.stats?.orders || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
