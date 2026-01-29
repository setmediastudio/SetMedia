"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Monitor,
  Calendar,
  BarChart3,
  Users,
  ShoppingBag,
  Upload,
  ImageIcon,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  HardDrive,
  CreditCard,
  Package,
  FileText,
} from "lucide-react"
import { useState, useEffect } from "react"

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
  onSignOut: () => void
  isCollapsed?: boolean
}

export function Sidebar({ user, onSignOut, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = user.role === "admin"
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [storageData, setStorageData] = useState({
    used: 0,
    total: 10737418240, // 10GB in bytes
    loading: true,
  })

  const adminNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Monitor },
    { href: "/admin/clients", label: "Clients", icon: Users },
    { href: "/admin/galleries", label: "Galleries", icon: ImageIcon },
    { href: "/admin/uploads", label: "Uploads", icon: Upload },
    { href: "/admin/bookings", label: "Bookings", icon: Calendar },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/pricing", label: "Pricing", icon: CreditCard },
    { href: "/admin/blog", label: "Blog", icon: FileText },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  const clientNavItems = [
    { href: "/client/dashboard", label: "Dashboard", icon: Monitor },
    { href: "/client/my-bookings", label: "My Bookings", icon: Calendar },
    { href: "/client/book-a-session", label: "Book a Session", icon: Calendar },
    { href: "/client/galleries", label: "Galleries", icon: ImageIcon },
    { href: "/client/orders", label: "Orders", icon: ShoppingBag },
    { href: "/client/notifications", label: "Notifications", icon: Bell },
    { href: "/client/settings", label: "Settings", icon: Settings },
  ]

  const navItems = isAdmin ? adminNavItems : clientNavItems

  useEffect(() => {
    if (isAdmin) {
      fetchStorageUsage()
      // Refresh storage data every 30 seconds
      const interval = setInterval(fetchStorageUsage, 30000)
      return () => clearInterval(interval)
    }
  }, [isAdmin])

  const fetchStorageUsage = async () => {
    try {
      const response = await fetch("/api/admin/storage-usage")
      if (response.ok) {
        const data = await response.json()
        setStorageData({
          used: data.used,
          total: data.total,
          loading: false,
        })
      }
    } catch (error) {
      console.error("Failed to fetch storage usage:", error)
      setStorageData((prev) => ({ ...prev, loading: false }))
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 GB"
    const gb = bytes / 1073741824
    return `${gb.toFixed(2)} GB`
  }

  const getStoragePercentage = () => {
    return (storageData.used / storageData.total) * 100
  }

  const getExpiryDate = () => {
    // Calculate expiry date (example: 1 year from now)
    const expiry = new Date()
    expiry.setFullYear(expiry.getFullYear() + 1)
    return expiry.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar-background text-sidebar-foreground rounded-lg border border-sidebar-border shadow-lg"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileOpen(false)} />
      )}

      <div
        className={cn(
          "flex flex-col h-screen bg-sidebar-background border-r border-sidebar-border transition-all duration-300 z-40",
          "fixed lg:relative",
          "w-64",
          "sidebar-mobile",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col items-center py-8 border-b border-sidebar-border px-6">
          <div className="w-12 h-12 bg-sidebar-primary rounded-xl flex items-center justify-center mb-4">
            <div className="text-sidebar-primary-foreground font-bold text-xl">S</div>
          </div>
          <div className="text-sidebar-foreground font-bold text-lg mb-1">Set Media</div>
          <div className="text-sidebar-foreground/70 text-sm">Solutions</div>
        </div>

        <nav className="flex-1 flex flex-col py-6 space-y-2 px-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                <div
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl transition-all cursor-pointer group",
                    "space-x-3",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {isAdmin && (
          <div className="px-4 py-4 border-t border-sidebar-border">
            <div className="bg-sidebar-accent rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-sidebar-foreground/70" />
                  <span className="text-xs font-medium text-sidebar-foreground/70">Available Storage</span>
                </div>
              </div>
              <div className="space-y-2">
                {storageData.loading ? (
                  <div className="text-xs text-sidebar-foreground/70">Loading...</div>
                ) : (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-sidebar-foreground font-semibold">{formatBytes(storageData.used)}</span>
                      <span className="text-sidebar-foreground/70">/ {formatBytes(storageData.total)}</span>
                    </div>
                    <Progress value={getStoragePercentage()} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span className="text-sidebar-foreground/70">{getStoragePercentage().toFixed(1)}%</span>
                      <span className="text-sidebar-foreground/70">Exp: {getExpiryDate()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</div>
              <div className="text-xs text-sidebar-foreground/70 truncate">{user.email}</div>
            </div>
          </div>
          <Button
            onClick={onSignOut}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>
    </>
  )
}
