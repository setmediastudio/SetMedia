import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Booking from "@/models/Booking"

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

    if (status && status !== "all") {
      query.status = status
    }

    // Get bookings with user info
    const bookingsQuery = Booking.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    if (search) {
      // For search, we need to populate first then filter
      const allBookings = await Booking.find(query).populate("userId", "name email").sort({ createdAt: -1 })

      const filteredBookings = allBookings.filter(
        (booking) =>
          booking.service.toLowerCase().includes(search.toLowerCase()) ||
          (booking.userId as any).name.toLowerCase().includes(search.toLowerCase()) ||
          (booking.userId as any).email.toLowerCase().includes(search.toLowerCase()),
      )

      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedBookings = filteredBookings.slice(startIndex, endIndex)

      return NextResponse.json({
        bookings: paginatedBookings,
        pagination: {
          page,
          limit,
          total: filteredBookings.length,
          pages: Math.ceil(filteredBookings.length / limit),
        },
      })
    }

    const bookings = await bookingsQuery
    const total = await Booking.countDocuments(query)

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin bookings API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bookingId, status, adminNotes } = await request.json()

    if (!bookingId || !status) {
      return NextResponse.json({ error: "Booking ID and status are required" }, { status: 400 })
    }

    await dbConnect()

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status,
        ...(adminNotes && { adminNotes }),
      },
      { new: true },
    ).populate("userId", "name email")

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error("Admin booking update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
