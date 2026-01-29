export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Product from "@/models/Product"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    // Get all active services
    const services = await Product.find({
      type: "service",
      isActive: true,
    }).sort({ createdAt: -1 })

    return NextResponse.json({ services })
  } catch (error) {
    console.error("Services API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
