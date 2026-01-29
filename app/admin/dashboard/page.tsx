"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { Shield, Users, FileImage, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatCard, GreetingCard } from "@/components/dashboard/stat-card"
import { RecentlyViewedAlbums, AlbumStatusSection } from "@/components/dashboard/recently-viewed-albums"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface AdminStats {
  totalClients: number
  totalUploads: number
  totalBookings: number
  totalRevenue: number
  activeProjects: number
  completedSessions: number
  galleryViews: number
  monthlyGrowth: number
}

interface ActiveUser {
  id: string
  name: string
  email: string
  image?: string
  role: string
  lastActive: string
  isOnline: boolean
}

interface ActivityItem {
  id: string
  type: "upload" | "booking" | "order" | "gallery"
  title: string
  description: string
  user?: {
    name: string
    image?: string
  }
  timestamp: Date
  status?: "completed" | "pending" | "processing"
}

interface RevenueData {
  month: string
  revenue: number
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [stats, setStats] = useState<AdminStats>({
    totalClients: 0,
    totalUploads: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeProjects: 0,
    completedSessions: 0,
    galleryViews: 0,
    monthlyGrowth: 0,
  })
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, activityRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/online-users"),
        fetch("/api/admin/recent-activity"),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
        if (statsData.revenueData) {
          setRevenueData(statsData.revenueData)
        }
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setActiveUsers(usersData.filter((user: ActiveUser) => user.isOnline))
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setRecentActivity(
          activityData.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          })),
        )
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
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

  const bookingStatusData = [
    { name: "Approved", value: 40, color: "#0891b2" },
    { name: "Pending", value: 25, color: "#f59e0b" },
  ]

  const deliveredAlbumsData = [
    { month: "Jan 25", albums: 35 },
    { month: "Feb 25", albums: 42 },
    { month: "Mar 25", albums: 38 },
    { month: "Apr 25", albums: 48 },
    { month: "May 25", albums: 40 },
    { month: "Jun 25", albums: 52 },
    { month: "Jul 25", albums: 45 },
    { month: "Aug 25", albums: 38 },
    { month: "Sep 25", albums: 42 },
  ]

  const recentlyCreatedAlbums = [
    {
      id: "1",
      title: "Wedding Album",
      coverImage: "/wedding-photoshoot.jpg",
      status: "finalized" as const,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      clientName: "Sarah Kumar",
    },
    {
      id: "2",
      title: "Birthday Photos",
      coverImage: "/birthday-celebration.jpg",
      status: "pending" as const,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      clientName: "Krishna",
    },
    {
      id: "3",
      title: "Portrait Session",
      coverImage: "/professional-portrait.png",
      status: "finalized" as const,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      clientName: "Vijay Krishnan",
    },
  ]

  const approvedBookings = [
    {
      id: "1",
      title: "Wedding Album",
      coverImage: "/wedding-album-cover.png",
      status: "finalized" as const,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      clientName: "Sarah Kumar",
    },
    {
      id: "2",
      title: "Puberty Function",
      coverImage: "/traditional-ceremony.jpg",
      status: "finalized" as const,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      clientName: "Vijay Krishnan",
    },
    {
      id: "3",
      title: "Baby shower",
      coverImage: "/baby-shower-celebration.jpg",
      status: "finalized" as const,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      clientName: "Haritha",
    },
  ]

  const unapprovedBookings = [
    {
      id: "4",
      title: "Birthday Photos",
      coverImage: "/vibrant-birthday-celebration.png",
      status: "pending" as const,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      clientName: "Krishna",
    },
    {
      id: "5",
      title: "Haldi Function",
      coverImage: "/haldi-ceremony.png",
      status: "pending" as const,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      clientName: "Karthick",
    },
  ]

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Greeting Card */}
            <GreetingCard
              user={{
                name: session.user?.name,
                image: session.user?.image,
              }}
              className="lg:col-span-1"
            />

            {/* Stats Cards */}
            <StatCard
              title="No. of Clients"
              value={isLoading ? "..." : stats.totalClients || 23}
              icon={Users}
              gradientClass="stat-card-gradient-1"
            />

            <StatCard
              title="No. of Albums"
              value={isLoading ? "..." : stats.totalUploads || 150}
              icon={FileImage}
              gradientClass="stat-card-gradient-2"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentlyViewedAlbums
              albums={recentlyCreatedAlbums}
              className="lg:col-span-1"
              title="Recently Created Albums"
            />

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Active Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeUsers.length > 0 ? (
                  activeUsers.slice(0, 4).map((user, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || "/placeholder.svg"} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Online
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No active users</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Revenue
                </CardTitle>
                <div className="text-3xl font-bold text-primary">
                  ${isLoading ? "..." : stats.totalRevenue?.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground">Total revenue this month</p>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ChartContainer
                    config={{
                      revenue: { label: "Revenue", color: "#0891b2" },
                    }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={
                          revenueData.length > 0
                            ? revenueData
                            : [
                                { month: "Jan", revenue: 4500 },
                                { month: "Feb", revenue: 5200 },
                                { month: "Mar", revenue: 4800 },
                                { month: "Apr", revenue: 6100 },
                                { month: "May", revenue: 5900 },
                                { month: "Jun", revenue: 7200 },
                              ]
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Bar dataKey="revenue" fill="#0891b2" radius={[8, 8, 0, 0]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivered Albums Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivered Albums</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ChartContainer
                    config={{
                      albums: { label: "Albums", color: "#0891b2" },
                    }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deliveredAlbumsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Bar dataKey="albums" fill="#0891b2" radius={[8, 8, 0, 0]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <AlbumStatusSection
              finalizedAlbums={approvedBookings}
              pendingAlbums={unapprovedBookings}
              finalizedLabel="Approved"
              pendingLabel="Unapproved"
            />
          </div>
        </main>
      </div>
    </div>
  )
}
