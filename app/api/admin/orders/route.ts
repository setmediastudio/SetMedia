import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    await dbConnect()

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [{ orderNumber: { $regex: search, $options: "i" } }, { service: { $regex: search, $options: "i" } }]
    }

    if (status && status !== "all") {
      query.status = status
    }

    // Get orders with user info
    const orders = await Order.find(query)
      .populate("userId", "name email")
      .populate("bookingId", "service preferredDate")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Order.countDocuments(query)

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin orders API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, status, trackingNumber } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 })
    }

    await dbConnect()

    const updateData: any = { status }
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber
    }

    const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true }).populate("userId", "name email")

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Admin order update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
