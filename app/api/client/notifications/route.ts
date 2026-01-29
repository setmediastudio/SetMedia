export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Notification from "@/models/Notification"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const type = searchParams.get("type")
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    await connectDB()

    const filter: any = { userId: session.user.id }
    if (type) filter.type = type
    if (category) filter.category = category
    if (status) filter.status = status

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await Notification.countDocuments(filter)

    // Mark system notifications as read when fetched
    await Notification.updateMany(
      { userId: session.user.id, type: "system", status: { $ne: "read" } },
      { status: "read", readAt: new Date() },
    )

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, action } = body

    await connectDB()

    if (action === "markAsRead") {
      await Notification.updateMany(
        {
          _id: { $in: notificationIds },
          userId: session.user.id,
        },
        {
          status: "read",
          readAt: new Date(),
        },
      )
    }

    return NextResponse.json({ message: "Notifications updated successfully" })
  } catch (error) {
    console.error("Notifications update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
