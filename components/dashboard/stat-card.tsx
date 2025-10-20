import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  className?: string
  gradientClass?: string
}

interface GreetingCardProps {
  user: {
    name?: string | null
    image?: string | null
  }
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  className,
  gradientClass = "stat-card-gradient-1",
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden border-0 shadow-lg", className)}>
      <div className={cn("absolute inset-0", gradientClass)} />
      <CardContent className="relative p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium opacity-90">{title}</div>
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

export function GreetingCard({ user, className }: GreetingCardProps) {
  const currentTime = new Date().getHours()
  const greeting = currentTime < 12 ? "Good Morning" : currentTime < 18 ? "Good Afternoon" : "Good Evening"

  return (
    <Card className={cn("relative overflow-hidden border-0 shadow-lg stat-card-gradient-3", className)}>
      <CardContent className="relative p-6 text-white">
        <div className="text-sm font-medium opacity-90 mb-2">{greeting},</div>
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 border-2 border-white/30">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback className="bg-white/20 text-white font-semibold">
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-2xl font-bold">{user.name?.split(" ")[0] || "User"}!</div>
            <div className="text-sm opacity-75">Welcome back</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
