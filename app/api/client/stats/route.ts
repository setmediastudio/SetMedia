export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Upload from "@/models/Upload"
import Booking from "@/models/Booking"
import Order from "@/models/Order"
import Gallery from "@/models/Gallery"
import SavedMedia from "@/models/SavedMedia"
import Like from "@/models/Like"
import { getUserObjectId } from "@/lib/admin-helper"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userId = getUserObjectId(session.user.id)

    const [totalPhotos, totalAlbums, totalBookings, totalOrders, savedCount, likedCount] = await Promise.all([
      Upload.countDocuments({
        $or: [{ uploadedBy: userId }, { assignedUsers: userId }, { paidUsers: userId }],
        status: "processed",
      }),
      Gallery.countDocuments({
        $or: [{ createdBy: userId }, { allowedClients: userId }, { paidUsers: userId }],
        status: "active",
      }),
      Booking.countDocuments({ userId: session.user.id }),
      Order.countDocuments({ userId: session.user.id }),
      SavedMedia.countDocuments({ userId }),
      Like.countDocuments({ userId }),
    ])

    // Get finalized and pending bookings
    const [finalizedBookings, pendingBookings] = await Promise.all([
      Booking.countDocuments({ userId: session.user.id, status: "confirmed" }),
      Booking.countDocuments({ userId: session.user.id, status: "pending" }),
    ])

    return NextResponse.json({
      totalPhotos,
      totalAlbums,
      totalBookings,
      totalOrders,
      savedCount,
      likedCount,
      finalizedBookings,
      pendingBookings,
    })
  } catch (error) {
    console.error("Client stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
