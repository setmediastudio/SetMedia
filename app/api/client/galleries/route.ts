import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Gallery from "@/models/Gallery"
import { getUserObjectId } from "@/lib/admin-helper"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userId = getUserObjectId(session.user.id)

    const galleries = await Gallery.find({
      $or: [
        { createdBy: userId },
        { allowedClients: userId },
        { paidUsers: userId },
        { isPublic: true, isPaid: false },
      ],
      status: "active",
    })
      .populate("uploads", "fileName originalName fileType publicUrl storageKey bucket")
      .sort({ createdAt: -1 })

    return NextResponse.json({ galleries })
  } catch (error) {
    console.error("Galleries fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      title,
      description,
      password,
      isPublic,
      uploads,
      watermarkEnabled,
      watermarkText,
      watermarkOpacity,
      downloadEnabled,
      isPaid,
      price,
      tags,
      expiresAt,
    } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    await dbConnect()

    const userId = getUserObjectId(session.user.id)

    const galleryData: any = {
      createdBy: userId,
      title,
      description,
      isPublic: isPublic || false,
      uploads: uploads || [],
      watermarkEnabled: watermarkEnabled !== false,
      watermarkText: watermarkText || "© SetMedia",
      watermarkOpacity: watermarkOpacity || 0.5,
      downloadEnabled: downloadEnabled || false,
      isPaid: isPaid || false,
      price: price || 0,
      tags: tags || [],
    }

    if (password) {
      galleryData.password = await bcrypt.hash(password, 12)
    }

    if (expiresAt) {
      galleryData.expiresAt = new Date(expiresAt)
    }

    const gallery = await Gallery.create(galleryData)

    return NextResponse.json({ gallery }, { status: 201 })
  } catch (error) {
    console.error("Gallery creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
