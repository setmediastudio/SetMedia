import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Gallery from "@/models/Gallery"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const gallery = await Gallery.findOne({
      _id: params.id,
      userId: session.user.id,
    }).populate("uploads", "fileName originalName fileType s3Url metadata")

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 })
    }

    return NextResponse.json({ gallery })
  } catch (error) {
    console.error("Gallery fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updateData = await request.json()

    await dbConnect()

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12)
    }

    const gallery = await Gallery.findOneAndUpdate({ _id: params.id, userId: session.user.id }, updateData, {
      new: true,
    }).populate("uploads", "fileName originalName fileType s3Url")

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 })
    }

    return NextResponse.json({ gallery })
  } catch (error) {
    console.error("Gallery update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const gallery = await Gallery.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    })

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Gallery deleted successfully" })
  } catch (error) {
    console.error("Gallery deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
