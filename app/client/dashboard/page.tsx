"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { ClientSidebar } from "@/components/dashboard/client-sidebar"
import { Header } from "@/components/dashboard/header"
import { StatCard, GreetingCard } from "@/components/dashboard/stat-card"
import { RecentlyViewedAlbums } from "@/components/dashboard/recently-viewed-albums"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis } from "recharts"
import { Calendar, ShoppingBag, FileImage, Camera, Download, Bookmark } from "lucide-react"
import Link from "next/link"
import { CameraLoading } from "@/components/camera-loading"

interface ClientStats {
  totalPhotos: number
  totalAlbums: number
  totalBookings: number
  totalOrders: number
  savedCount: number
  likedCount: number
  finalizedBookings: number
  pendingBookings: number
}

interface RecentView {
  id: string
  title: string
  thumbnail: string
  viewedAt: string
  fileType: string
}

interface ActivityData {
  month: string
  activities: number
}

export default function ClientDashboardPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [stats, setStats] = useState<ClientStats>({
    totalPhotos: 0,
    totalAlbums: 0,
    totalBookings: 0,
    totalOrders: 0,
    savedCount: 0,
    likedCount: 0,
    finalizedBookings: 0,
    pendingBookings: 0,
  })
  const [recentViews, setRecentViews] = useState<RecentView[]>([])
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, viewsRes, activityRes] = await Promise.all([
        fetch("/api/client/stats"),
        fetch("/api/client/recent-views"),
        fetch("/api/client/activity"),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (viewsRes.ok) {
        const viewsData = await viewsRes.json()
        setRecentViews(viewsData)
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setActivityData(activityData)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
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

  const albumStatusData = [
    { name: "Finalized", value: stats.finalizedBookings, color: "#0891b2" },
    { name: "Pending", value: stats.pendingBookings, color: "#06b6d4" },
  ]

  const recentlyViewedAlbums = recentViews.map((view) => ({
    id: view.id,
    title: view.title,
    coverImage: view.thumbnail,
    status: "finalized" as const,
    createdAt: new Date(view.viewedAt),
    clientName: session?.user?.name || "You",
  }))

  if (!session) {
    return <CameraLoading />
  }

  return (
    <div className="flex h-screen bg-background">
      <ClientSidebar />

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GreetingCard
              user={{
                name: session.user?.name,
                image: session.user?.image,
              }}
              className="lg:col-span-1"
            />

            <StatCard
              title="My Photos"
              value={isLoading ? "..." : stats.totalPhotos.toString()}
              icon={FileImage}
              gradientClass="stat-card-gradient-1"
            />

            <StatCard
              title="My Albums"
              value={isLoading ? "..." : stats.totalAlbums.toString()}
              icon={Camera}
              gradientClass="stat-card-gradient-2"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentlyViewedAlbums albums={recentlyViewedAlbums.slice(0, 6)} className="lg:col-span-1" />

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/client/book-a-session">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Session
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/client/orders">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    View Orders
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/client/galleries">
                    <FileImage className="h-4 w-4 mr-2" />
                    View Galleries
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/client/my-media">
                    <Download className="h-4 w-4 mr-2" />
                    My Downloads
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/client/saved-media">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Saved Media
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Booking Status</CardTitle>
                <div className="flex space-x-2">
                  <Badge variant="default" className="bg-primary">
                    Finalized: {stats.finalizedBookings}
                  </Badge>
                  <Badge variant="secondary">Pending: {stats.pendingBookings}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {albumStatusData.some((d) => d.value > 0) ? (
                  <>
                    <div className="h-48 flex items-center justify-center">
                      <ChartContainer
                        config={{
                          finalized: { label: "Finalized", color: "#0891b2" },
                          pending: { label: "Pending", color: "#06b6d4" },
                        }}
                        className="h-full w-full"
                      >
                        <PieChart>
                          <Pie
                            data={albumStatusData.filter((d) => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {albumStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.totalBookings}</div>
                      <div className="text-sm text-muted-foreground">Total Bookings</div>
                    </div>
                  </>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">No bookings yet</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activityData.length > 0 ? (
                  <div className="h-64">
                    <ChartContainer
                      config={{
                        activities: { label: "Activities", color: "#0891b2" },
                      }}
                      className="h-full w-full"
                    >
                      <LineChart data={activityData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Line
                          type="monotone"
                          dataKey="activities"
                          stroke="#0891b2"
                          strokeWidth={3}
                          dot={{ fill: "#0891b2", strokeWidth: 2, r: 4 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </LineChart>
                    </ChartContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No activity data yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
