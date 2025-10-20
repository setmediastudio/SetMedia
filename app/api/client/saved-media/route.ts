export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import SavedMedia from "@/models/SavedMedia"
import { getUserObjectId } from "@/lib/admin-helper"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const savedMedia = await SavedMedia.find({ user: getUserObjectId(session.user.id) })
      .populate({
        path: "upload",
        populate: {
          path: "portfolioCategory",
          select: "name slug",
        },
      })
      .sort({ savedAt: -1 })

    return NextResponse.json({ savedMedia })
  } catch (error) {
    console.error("Saved media API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { uploadId } = await request.json()

    if (!uploadId) {
      return NextResponse.json({ error: "Upload ID is required" }, { status: 400 })
    }

    await dbConnect()

    const existingSave = await SavedMedia.findOne({
      user: getUserObjectId(session.user.id),
      upload: uploadId,
    })

    if (existingSave) {
      return NextResponse.json({ message: "Already saved", saved: true })
    }

    await SavedMedia.create({
      user: getUserObjectId(session.user.id),
      upload: uploadId,
    })

    return NextResponse.json({ message: "Media saved successfully", saved: true })
  } catch (error) {
    console.error("Save media API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get("uploadId")

    if (!uploadId) {
      return NextResponse.json({ error: "Upload ID is required" }, { status: 400 })
    }

    await dbConnect()

    await SavedMedia.deleteOne({
      user: getUserObjectId(session.user.id),
      upload: uploadId,
    })

    return NextResponse.json({ message: "Media unsaved successfully", saved: false })
  } catch (error) {
    console.error("Unsave media API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
