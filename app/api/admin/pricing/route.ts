import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import ServicePricing from "@/models/ServicePricing"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const services = await ServicePricing.find().sort({ displayOrder: 1, serviceName: 1 })

    return NextResponse.json({ services })
  } catch (error) {
    console.error("Error fetching service pricing:", error)
    return NextResponse.json({ error: "Failed to fetch service pricing" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const data = await request.json()

    const service = await ServicePricing.create(data)

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error("Error creating service pricing:", error)
    return NextResponse.json({ error: "Failed to create service pricing" }, { status: 500 })
  }
}
