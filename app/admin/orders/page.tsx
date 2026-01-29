"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, ShoppingBag, Search, Eye, Package, Truck, DollarSign, Clock, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

interface Order {
  _id: string
  orderNumber: string
  service: string
  packageType: string
  totalAmount: number
  status: string
  paymentStatus: string
  trackingNumber?: string
  createdAt: string
  userId: {
    _id: string
    name: string
    email: string
  }
  bookingId?: {
    service: string
    preferredDate: string
  }
}

export default function AdminOrdersPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    shipped: 0,
    total: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    fetchOrders()
  }, [searchTerm, statusFilter])

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/admin/orders?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)

        // Calculate stats
        const pending = data.orders.filter((o: Order) => o.status === "pending").length
        const processing = data.orders.filter((o: Order) => o.status === "processing").length
        const completed = data.orders.filter((o: Order) => o.status === "completed").length
        const shipped = data.orders.filter((o: Order) => o.status === "shipped").length
        const total = data.orders.length
        const totalRevenue = data.orders
          .filter((o: Order) => o.paymentStatus === "paid")
          .reduce((sum: number, o: Order) => sum + o.totalAmount, 0)

        setStats({ pending, processing, completed, shipped, total, totalRevenue })
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders.",
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

  const handleStatusUpdate = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status: newStatus, trackingNumber }),
      })

      if (response.ok) {
        toast({
          title: "Status updated",
          description: `Order status changed to ${newStatus}.`,
        })
        fetchOrders() // Refresh the list
      } else {
        throw new Error("Failed to update status")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-600 hover:bg-yellow-600"
      case "processing":
        return "bg-blue-600 hover:bg-blue-600"
      case "completed":
        return "bg-green-600 hover:bg-green-600"
      case "shipped":
        return "bg-purple-600 hover:bg-purple-600"
      case "delivered":
        return "bg-emerald-600 hover:bg-emerald-600"
      case "cancelled":
        return "bg-red-600 hover:bg-red-600"
      default:
        return "bg-gray-600 hover:bg-gray-600"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-600 hover:bg-green-600"
      case "pending":
        return "bg-yellow-600 hover:bg-yellow-600"
      case "failed":
        return "bg-red-600 hover:bg-red-600"
      case "refunded":
        return "bg-gray-600 hover:bg-gray-600"
      default:
        return "bg-gray-600 hover:bg-gray-600"
    }
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
              <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
              <p className="text-muted-foreground">Track and manage client orders and deliveries.</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : stats.pending}</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Processing</p>
                    <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : stats.processing}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : stats.completed}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Shipped</p>
                    <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : stats.shipped}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Truck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : stats.total}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? "..." : `$${stats.totalRevenue.toLocaleString()}`}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by order number, service, or client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Manage client orders and track deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No orders found.</p>
                  <p className="text-sm">Orders will appear here as clients make purchases.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{order.orderNumber}</p>
                              <p className="text-xs text-muted-foreground capitalize">{order.packageType} package</p>
                              {order.trackingNumber && <p className="text-xs text-blue-600">#{order.trackingNumber}</p>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{order.userId.name}</p>
                              <p className="text-xs text-muted-foreground">{order.userId.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{order.service}</p>
                            {order.bookingId && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.bookingId.preferredDate).toLocaleDateString()}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">${order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPaymentStatusColor(order.paymentStatus)}>{order.paymentStatus}</Badge>
                          </TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                              {order.status === "processing" && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleStatusUpdate(order._id, "completed")}
                                >
                                  Complete
                                </Button>
                              )}
                              {order.status === "completed" && order.packageType !== "digital" && (
                                <Button
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700"
                                  onClick={() => handleStatusUpdate(order._id, "shipped", "TRK" + Date.now())}
                                >
                                  Ship
                                </Button>
                              )}
                            </div>
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
