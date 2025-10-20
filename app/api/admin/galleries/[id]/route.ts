export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Gallery from "@/models/Gallery"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const gallery = await Gallery.findById(params.id)
      .populate("createdBy", "name email")
      .populate("uploads")
      .populate("allowedClients", "name email")

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 })
    }

    return NextResponse.json({ gallery })
  } catch (error) {
    console.error("Get gallery error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    await dbConnect()

    const gallery = await Gallery.findByIdAndUpdate(params.id, body, { new: true })

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, gallery })
  } catch (error) {
    console.error("Update gallery error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const gallery = await Gallery.findByIdAndDelete(params.id)

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete gallery error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
