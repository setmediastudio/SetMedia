export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get recently active users (users who have been active in the last 24 hours)
    // For now, we'll get the most recently created users as a proxy for "online" users
    // In a real implementation, you'd track user sessions/activity timestamps
    const recentUsers = await User.find({ role: "user" })
      .select("name email image role createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean()

    // Transform the data to match the expected format
    const onlineUsers = recentUsers.map((user, index) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image || "/professional-headshot.png",
      role: "Client",
      lastActive: getRelativeTime(user.updatedAt || user.createdAt),
    }))

    return NextResponse.json(onlineUsers)
  } catch (error) {
    console.error("Error fetching online users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
}
