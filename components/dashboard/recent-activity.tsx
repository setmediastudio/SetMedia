"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"

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

interface RecentActivityProps {
  activities: ActivityItem[]
  className?: string
}

const getActivityColor = (type: string) => {
  switch (type) {
    case "upload":
      return "bg-blue-100 text-blue-800"
    case "booking":
      return "bg-green-100 text-green-800"
    case "order":
      return "bg-purple-100 text-purple-800"
    case "gallery":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                {activity.user && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user.image || "/placeholder.svg"} />
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {activity.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="secondary" className={getActivityColor(activity.type)}>
                      {activity.type}
                    </Badge>
                    {activity.status && (
                      <Badge variant="outline" className="text-xs">
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
