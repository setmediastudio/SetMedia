import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Booking from "@/models/Booking"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { service, preferredDate, preferredTime, location, contactPhone, notes } = await request.json()

    if (!service || !preferredDate) {
      return NextResponse.json({ error: "Service and preferred date are required" }, { status: 400 })
    }

    await dbConnect()

    const booking = await Booking.create({
      userId: session.user.id,
      service,
      serviceType: service, // Add serviceType field required by the model
      preferredDate: new Date(preferredDate),
      preferredTime,
      location,
      contactPhone,
      notes,
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error("Booking creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const bookings = await Booking.find({ userId: session.user.id }).sort({ createdAt: -1 })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Bookings fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
