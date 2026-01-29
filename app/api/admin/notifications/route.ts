import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Notification from "@/models/Notification"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const type = searchParams.get("type")
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    await connectDB()

    const filter: any = {}
    if (type) filter.type = type
    if (category) filter.category = category
    if (status) filter.status = status
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
        { "metadata.email": { $regex: search, $options: "i" } },
      ]
    }

    const notifications = await Notification.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await Notification.countDocuments(filter)

    // Get statistics
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const errorLogs = await Notification.find({
      status: "failed",
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    return NextResponse.json({
      notifications,
      stats,
      errorLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin notifications fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userIds, type, category, title, message } = body

    await connectDB()

    const notifications = userIds.map((userId: string) => ({
      userId,
      type,
      category,
      title,
      message,
      status: "pending",
    }))

    await Notification.insertMany(notifications)

    return NextResponse.json({
      message: "Notifications created successfully",
      count: notifications.length,
    })
  } catch (error) {
    console.error("Admin notification creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
