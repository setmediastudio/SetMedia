"use client"

import { useState, useEffect } from "react"
import { Search, Settings, HelpCircle, Menu, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
  onSignOut: () => void
  onMenuToggle?: () => void
  onSidebarToggle?: () => void
}

interface Notification {
  id: string
  type: "booking" | "payment" | "order" | "system"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export function Header({ user, onSignOut, onMenuToggle, onSidebarToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Get current date
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  useEffect(() => {
    if (user.role === "admin") {
      fetchNotifications()
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user.role])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications?limit=15")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-3 sm:px-4 md:px-6 gap-2 sm:gap-3 md:gap-4">
      {/* Left Section - Search */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSidebarToggle}
          className="hidden lg:flex h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-accent flex-shrink-0"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="relative flex-1 min-w-0 max-w-md">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 sm:pl-10 pr-2 sm:pr-3 bg-muted border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary text-sm w-full"
          />
        </div>
      </div>

      <div className="hidden xl:block text-sm text-muted-foreground whitespace-nowrap">{currentDate}</div>

      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <Settings className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>

        <div className="text-muted-foreground hover:text-foreground">
          <ThemeToggle />
        </div>

        {user.role === "admin" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-accent relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-popover border-border">
              <DropdownMenuLabel className="text-popover-foreground font-semibold">
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="default" className="ml-2 text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <ScrollArea className="h-96">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`flex flex-col items-start p-3 cursor-pointer ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between w-full mb-1">
                        <span className="font-medium text-sm">{notification.title}</span>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(notification.timestamp)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {notification.type}
                      </Badge>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-accent relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full"></span>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-foreground hover:bg-accent px-2 sm:px-3 py-2 h-auto"
            >
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium truncate max-w-[120px]">{user.name}</div>
                <div className="text-xs text-muted-foreground">San Francisco, CA</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
            <DropdownMenuLabel className="text-popover-foreground">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <Badge variant={user.role === "admin" ? "destructive" : "secondary"} className="w-fit text-xs">
                  {user.role === "admin" ? "Admin" : "Client"}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-popover-foreground hover:bg-accent">Profile Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-popover-foreground hover:bg-accent">Account Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={onSignOut} className="text-destructive hover:bg-accent hover:text-destructive">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="lg:hidden h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-accent flex-shrink-0"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
