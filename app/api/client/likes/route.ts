import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Like from "@/models/Like"
import { getUserObjectId } from "@/lib/admin-helper"

// GET - Fetch user's liked uploads
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userId = getUserObjectId(session.user.id)
    const likes = await Like.find({ user: userId }).populate("upload")

    const likedUploadIds = likes.map((like) => like.upload._id.toString())

    return NextResponse.json({ likes: likedUploadIds })
  } catch (error) {
    console.error("Failed to fetch likes:", error)
    return NextResponse.json({ error: "Failed to fetch likes" }, { status: 500 })
  }
}

// POST - Like an upload
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

    const userId = getUserObjectId(session.user.id)

    // Create like (will fail if already exists due to unique index)
    const like = await Like.create({
      user: userId,
      upload: uploadId,
    })

    return NextResponse.json({ success: true, like })
  } catch (error: any) {
    // Handle duplicate key error (user already liked this upload)
    if (error.code === 11000) {
      return NextResponse.json({ error: "Already liked" }, { status: 400 })
    }

    console.error("Failed to like upload:", error)
    return NextResponse.json({ error: "Failed to like upload" }, { status: 500 })
  }
}

// DELETE - Unlike an upload
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

    const userId = getUserObjectId(session.user.id)

    await Like.deleteOne({ user: userId, upload: uploadId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to unlike upload:", error)
    return NextResponse.json({ error: "Failed to unlike upload" }, { status: 500 })
  }
}
