export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import ActivityLog from "@/models/ActivityLog"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get recent activity logs with user information
    const recentActivity = await ActivityLog.find()
      .populate("userId", "name image")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Transform the data to match the expected format
    const formattedActivity = recentActivity.map((activity) => ({
      id: activity._id.toString(),
      type: activity.resource.toLowerCase(),
      title: formatActivityTitle(activity.action, activity.resource),
      description: formatActivityDescription(activity.action, activity.resource, activity.details),
      user: {
        name: (activity.userId as any)?.name || "Unknown User",
        image: (activity.userId as any)?.image || "/professional-headshot.png",
      },
      timestamp: activity.createdAt.toISOString(),
      status: getActivityStatus(activity.action),
    }))

    return NextResponse.json(formattedActivity)
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper functions to format activity data
function formatActivityTitle(action: string, resource: string): string {
  const actionMap: Record<string, string> = {
    create: "created",
    update: "updated",
    delete: "deleted",
    upload: "uploaded",
    download: "downloaded",
    view: "viewed",
    book: "booked",
    cancel: "cancelled",
  }

  const resourceMap: Record<string, string> = {
    upload: "photos",
    booking: "session",
    gallery: "gallery",
    order: "order",
    user: "account",
  }

  const actionText = actionMap[action.toLowerCase()] || action
  const resourceText = resourceMap[resource.toLowerCase()] || resource

  return `${resourceText.charAt(0).toUpperCase() + resourceText.slice(1)} ${actionText}`
}

function formatActivityDescription(action: string, resource: string, details: any): string {
  if (details?.description) return details.description

  const descriptions: Record<string, string> = {
    "upload-create": "New photos were uploaded to the gallery",
    "booking-create": "A new session was booked",
    "gallery-create": "A new gallery was created",
    "order-create": "A new order was placed",
    "user-create": "A new user account was created",
  }

  const key = `${resource.toLowerCase()}-${action.toLowerCase()}`
  return descriptions[key] || `${action} performed on ${resource}`
}

function getActivityStatus(action: string): string {
  const statusMap: Record<string, string> = {
    create: "completed",
    update: "completed",
    upload: "completed",
    book: "pending",
    cancel: "cancelled",
    delete: "completed",
  }

  return statusMap[action.toLowerCase()] || "completed"
}
