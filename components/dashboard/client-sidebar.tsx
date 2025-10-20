"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Images,
  Calendar,
  ShoppingBag,
  Settings,
  Bookmark,
  Download,
  Bell,
  CalendarCheck,
} from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/client/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Galleries",
    href: "/client/galleries",
    icon: Images,
  },
  {
    title: "Saved Media",
    href: "/client/saved-media",
    icon: Bookmark,
  },
  {
    title: "My Media",
    href: "/client/my-media",
    icon: Download,
  },
  {
    title: "My Bookings",
    href: "/client/my-bookings",
    icon: CalendarCheck,
  },
  {
    title: "Book a Session",
    href: "/client/book-a-session",
    icon: Calendar,
  },
  {
    title: "Orders",
    href: "/client/orders",
    icon: ShoppingBag,
  },
  {
    title: "Notifications",
    href: "/client/notifications",
    icon: Bell,
  },
  {
    title: "Account Settings",
    href: "/client/account-settings",
    icon: Settings,
  },
  {
    title: "Settings",
    href: "/client/settings",
    icon: Settings,
  },
]

export function ClientSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r bg-muted/30 min-h-screen p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Client Area</h2>
        <p className="text-sm text-muted-foreground">Manage your account</p>
      </div>
      <nav className="space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
