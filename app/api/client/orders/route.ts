export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const orders = await Order.find({ userId: session.user.id })
      .populate("bookingId", "service preferredDate")
      .sort({ createdAt: -1 })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
