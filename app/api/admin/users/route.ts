export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Upload from "@/models/Upload"
import Booking from "@/models/Booking"
import Order from "@/models/Order"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    await dbConnect()

    // Build query for regular users only (exclude admins)
    const query: any = { role: "user" }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    // Get users
    const users = await User.find(query)
      .select("name email role provider createdAt updatedAt image")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    // Get stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [uploads, bookings, orders] = await Promise.all([
          Upload.countDocuments({ userId: user._id }),
          Booking.countDocuments({ userId: user._id }),
          Order.countDocuments({ userId: user._id }),
        ])

        return {
          ...user.toObject(),
          stats: {
            uploads,
            bookings,
            orders,
          },
        }
      }),
    )

    const total = await User.countDocuments(query)

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin users API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
