export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import ActivityLog from "@/models/ActivityLog"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get recent activity logs for the current user
    const recentActivity = await ActivityLog.find({ userId: session.user?.id }).sort({ createdAt: -1 }).limit(10).lean()

    // Transform the data to match the expected format
    const formattedActivity = recentActivity.map((activity) => ({
      id: activity._id.toString(),
      type: activity.resource.toLowerCase(),
      title: formatClientActivityTitle(activity.action, activity.resource),
      description: formatClientActivityDescription(activity.action, activity.resource, activity.details),
      timestamp: activity.createdAt.toISOString(),
      status: getActivityStatus(activity.action),
    }))

    return NextResponse.json(formattedActivity)
  } catch (error) {
    console.error("Error fetching client activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper functions for client activity formatting
function formatClientActivityTitle(action: string, resource: string): string {
  const titleMap: Record<string, string> = {
    "upload-create": "Photos Uploaded",
    "booking-create": "Session Booked",
    "gallery-view": "Gallery Viewed",
    "order-create": "Order Placed",
    "gallery-create": "Gallery Created",
  }

  const key = `${resource.toLowerCase()}-${action.toLowerCase()}`
  return titleMap[key] || `${resource} ${action}`
}

function formatClientActivityDescription(action: string, resource: string, details: any): string {
  if (details?.description) return details.description

  const descriptions: Record<string, string> = {
    "upload-create": "You successfully uploaded photos to your gallery",
    "booking-create": "Your session has been booked successfully",
    "gallery-view": "You viewed your photo gallery",
    "order-create": "Your order has been placed and is being processed",
    "gallery-create": "A new gallery was created for you",
  }

  const key = `${resource.toLowerCase()}-${action.toLowerCase()}`
  return descriptions[key] || `You performed ${action} on ${resource}`
}

function getActivityStatus(action: string): string {
  const statusMap: Record<string, string> = {
    create: "completed",
    update: "completed",
    upload: "completed",
    book: "pending",
    cancel: "cancelled",
    delete: "completed",
    view: "completed",
  }

  return statusMap[action.toLowerCase()] || "completed"
}
