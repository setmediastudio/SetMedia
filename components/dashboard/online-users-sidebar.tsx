"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface OnlineUser {
  id: string
  name: string
  email: string
  image?: string
  role: string
  lastActive: string
}

interface OnlineUsersSidebarProps {
  users?: OnlineUser[]
}

export function OnlineUsersSidebar({ users = [] }: OnlineUsersSidebarProps) {
  // Default users if none provided
  const defaultUsers: OnlineUser[] = [
    {
      id: "1",
      name: "Robert Alex",
      email: "robert@example.com",
      image: "/professional-headshot.png",
      role: "Writer, Editor",
      lastActive: "2 min ago",
    },
    {
      id: "2",
      name: "Anthony Gomes",
      email: "anthony@example.com",
      image: "/professional-headshot.png",
      role: "Designer",
      lastActive: "5 min ago",
    },
    {
      id: "3",
      name: "Roberto Thuan",
      email: "roberto@example.com",
      image: "/professional-headshot.png",
      role: "UX Designer",
      lastActive: "10 min ago",
    },
    {
      id: "4",
      name: "Mogen Polshin",
      email: "mogen@example.com",
      image: "/professional-headshot.png",
      role: "UI Designer",
      lastActive: "15 min ago",
    },
    {
      id: "5",
      name: "Mogen Pallak",
      email: "mogen.p@example.com",
      image: "/professional-headshot.png",
      role: "Writer, Editor",
      lastActive: "20 min ago",
    },
    {
      id: "6",
      name: "Shawon Rox",
      email: "shawon@example.com",
      image: "/professional-headshot.png",
      role: "Writer, Editor",
      lastActive: "25 min ago",
    },
    {
      id: "7",
      name: "Jonathan Doe",
      email: "jonathan@example.com",
      image: "/professional-headshot.png",
      role: "UX Engineer",
      lastActive: "30 min ago",
    },
    {
      id: "8",
      name: "Alex Morgan",
      email: "alex.m@example.com",
      image: "/professional-headshot.png",
      role: "Writer, Editor",
      lastActive: "35 min ago",
    },
  ]

  const displayUsers = users.length > 0 ? users : defaultUsers

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">ONLINE</h2>
          <Badge variant="secondary" className="bg-purple-600 text-white">
            {displayUsers.length}
          </Badge>
        </div>
      </div>

      {/* Users List */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {displayUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-3 group hover:bg-gray-800 p-2 rounded-lg transition-colors"
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.image || "/placeholder.svg"} />
                  <AvatarFallback className="bg-purple-600 text-white text-sm">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-gray-900 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{user.name}</div>
                <div className="text-gray-400 text-xs truncate">{user.role}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer - Offline Section */}
      <div className="p-6 border-t border-gray-800">
        <div className="text-gray-400 text-sm font-medium mb-2">OFFLINE</div>
        <div className="text-gray-500 text-xs">No offline users</div>
      </div>
    </div>
  )
}
