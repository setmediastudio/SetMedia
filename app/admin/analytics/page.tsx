"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Users, Upload, Calendar, DollarSign, Shield } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatCard } from "@/components/dashboard/stat-card"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AnalyticsData {
  overview?: {
    totalRevenue: number
    totalUploads: number
    totalBookings: number
    totalGalleries: number
    totalUsers: number
    recentRevenue: number
    recentUploads: number
    recentBookings: number
    recentUsers: number
  }
  revenue?: {
    chartData: Array<{ _id: string; revenue: number; count: number }>
    paymentMethods: Array<{ _id: string; revenue: number; count: number }>
  }
  activity?: {
    uploads: Array<{ _id: string; uploads: number; totalSize: number }>
    galleryViews: Array<{ _id: string; views: number; galleries: number }>
    bookingStatus: Array<{ _id: string; count: number }>
  }
  users?: {
    growth: Array<{ _id: string; newUsers: number }>
    byRole: Array<{ _id: string; count: number }>
    byProvider: Array<{ _id: string; count: number }>
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value / 100)
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<AnalyticsData>({})
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30d")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchAnalytics()
  }, [period, activeTab])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}&type=${activeTab}`)
      if (response.ok) {
        const result = await response.json()
        setData((prev) => ({ ...prev, [activeTab]: result[activeTab] }))
      } else {
        toast.error("Failed to load analytics data")
      }
    } catch (error) {
      toast.error("Error loading analytics")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
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

  const CustomStatCard = ({ title, value, change, icon: Icon, format = "number" }: any) => (
    <StatCard
      title={title}
      value={format === "currency" ? formatCurrency(value) : value.toLocaleString()}
      icon={Icon}
      gradientClass="stat-card-gradient-1"
    />
  )

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Monitor your platform performance and insights</p>
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : data.overview ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Revenue"
                    value={formatCurrency(data.overview.totalRevenue)}
                    icon={DollarSign}
                    gradientClass="stat-card-gradient-1"
                  />
                  <StatCard
                    title="Total Uploads"
                    value={data.overview.totalUploads}
                    icon={Upload}
                    gradientClass="stat-card-gradient-2"
                  />
                  <StatCard
                    title="Total Bookings"
                    value={data.overview.totalBookings}
                    icon={Calendar}
                    gradientClass="stat-card-gradient-3"
                  />
                  <StatCard
                    title="Total Users"
                    value={data.overview.totalUsers}
                    icon={Users}
                    gradientClass="stat-card-gradient-4"
                  />
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="revenue">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : data.revenue ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Revenue Trend</CardTitle>
                      <CardDescription>Revenue over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ChartContainer
                          config={{
                            revenue: { label: "Revenue", color: "hsl(var(--primary))" },
                          }}
                          className="h-full w-full"
                        >
                          <AreaChart data={data.revenue.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis tickFormatter={(value) => formatCurrency(value)} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                              type="monotone"
                              dataKey="revenue"
                              stroke="hsl(var(--primary))"
                              fill="hsl(var(--primary))"
                              fillOpacity={0.3}
                            />
                          </AreaChart>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Payment Methods</CardTitle>
                      <CardDescription>Revenue by payment method</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ChartContainer
                          config={{
                            revenue: { label: "Revenue", color: "hsl(var(--primary))" },
                          }}
                          className="h-full w-full"
                        >
                          <PieChart>
                            <Pie
                              data={data.revenue.paymentMethods}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="hsl(var(--primary))"
                              dataKey="revenue"
                            >
                              {data.revenue.paymentMethods.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="activity">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : data.activity ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Upload Activity</CardTitle>
                        <CardDescription>File uploads over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ChartContainer
                            config={{
                              uploads: { label: "Uploads", color: "hsl(var(--primary))" },
                            }}
                            className="h-full w-full"
                          >
                            <BarChart data={data.activity.uploads}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="_id" />
                              <YAxis />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="uploads" fill="hsl(var(--primary))" />
                            </BarChart>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Gallery Views</CardTitle>
                        <CardDescription>Gallery engagement over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ChartContainer
                            config={{
                              views: { label: "Views", color: "hsl(var(--chart-2))" },
                            }}
                            className="h-full w-full"
                          >
                            <LineChart data={data.activity.galleryViews}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="_id" />
                              <YAxis />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Line type="monotone" dataKey="views" stroke="hsl(var(--chart-2))" />
                            </LineChart>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Booking Status Distribution</CardTitle>
                      <CardDescription>Current booking statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {data.activity.bookingStatus.map((status, index) => (
                          <div key={status._id} className="text-center">
                            <div className="text-2xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                              {status.count}
                            </div>
                            <div className="text-sm text-muted-foreground capitalize">{status._id}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="users">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : data.users ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">User Growth</CardTitle>
                      <CardDescription>New user registrations over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ChartContainer
                          config={{
                            newUsers: { label: "New Users", color: "hsl(var(--primary))" },
                          }}
                          className="h-full w-full"
                        >
                          <AreaChart data={data.users.growth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                              type="monotone"
                              dataKey="newUsers"
                              stroke="hsl(var(--primary))"
                              fill="hsl(var(--primary))"
                              fillOpacity={0.3}
                            />
                          </AreaChart>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Users by Role</CardTitle>
                      <CardDescription>User distribution by role</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ChartContainer
                          config={{
                            count: { label: "Count", color: "hsl(var(--primary))" },
                          }}
                          className="h-full w-full"
                        >
                          <PieChart>
                            <Pie
                              data={data.users.byRole}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="hsl(var(--primary))"
                              dataKey="count"
                            >
                              {data.users.byRole.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Authentication Providers</CardTitle>
                      <CardDescription>How users are signing up</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {data.users.byProvider.map((provider, index) => (
                          <div key={provider._id} className="text-center">
                            <div className="text-2xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                              {provider.count}
                            </div>
                            <div className="text-sm text-muted-foreground capitalize">{provider._id}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
