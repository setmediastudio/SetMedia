export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import ServicePricing from "@/models/ServicePricing"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const serviceType = searchParams.get("serviceType")

    const query: any = { isActive: true }
    if (serviceType) {
      query.serviceType = serviceType
    }

    const services = await ServicePricing.find(query).sort({ displayOrder: 1, serviceName: 1 })

    return NextResponse.json({ services })
  } catch (error) {
    console.error("Error fetching service pricing:", error)
    return NextResponse.json({ error: "Failed to fetch service pricing" }, { status: 500 })
  }
}
