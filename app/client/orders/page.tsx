"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingBag, Download, Eye, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatCard } from "@/components/dashboard/stat-card"
import { CameraLoading } from "@/components/camera-loading"

interface Order {
  _id: string
  orderNumber: string
  service: string
  packageType: string
  totalAmount: number
  status: string
  paymentStatus: string
  createdAt: string
  downloadLinks?: string[]
  trackingNumber?: string
  bookingId?: {
    service: string
    preferredDate: string
  }
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/client/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
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
      title: "Signed out",
      description: "You have been signed out successfully.",
    })
    await signOut({ callbackUrl: "/" })
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
            <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
            <p className="text-muted-foreground">View and download your purchased photos and packages</p>
          </div>

          {/* Order Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              title="Total Orders"
              value={isLoading ? "..." : orders.length.toString()}
              icon={ShoppingBag}
              gradientClass="stat-card-gradient-1"
            />

            <StatCard
              title="Ready for Download"
              value={
                isLoading
                  ? "..."
                  : orders
                      .filter((order) => order.status === "completed" && order.downloadLinks?.length)
                      .length.toString()
              }
              icon={Download}
              gradientClass="stat-card-gradient-2"
            />

            <StatCard
              title="In Progress"
              value={isLoading ? "..." : orders.filter((order) => order.status === "processing").length.toString()}
              icon={Package}
              gradientClass="stat-card-gradient-3"
            />
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>Your photography orders and downloads</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p>Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No orders yet</h3>
                    <p className="text-muted-foreground">Book a session to get started!</p>
                  </div>
                  <Button asChild>
                    <a href="/client/book-a-session">Book a Session</a>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{order.service}</TableCell>
                        <TableCell className="capitalize">{order.packageType}</TableCell>
                        <TableCell>
                          <Badge
                            variant={order.status === "completed" ? "default" : "secondary"}
                            className={order.status === "completed" ? "bg-green-600" : ""}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">${order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {order.status === "completed" && order.downloadLinks?.length && (
                              <Button size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Download Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Download Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>• Digital packages will be available for download once processing is complete</p>
                <p>• Downloads are available for 30 days after completion</p>
                <p>• High-resolution files are included in digital packages</p>
                <p>• Print packages will be shipped to your registered address</p>
                <p>• Contact us if you need assistance with downloads or have questions about your order</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
