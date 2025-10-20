import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import ViewHistory from "@/models/ViewHistory"
import UserActivity from "@/models/UserActivity"
import { getUserObjectId } from "@/lib/admin-helper"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { uploadId } = await request.json()

    if (!uploadId) {
      return NextResponse.json({ error: "Upload ID required" }, { status: 400 })
    }

    await dbConnect()

    const userId = getUserObjectId(session.user.id)

    // Create view history
    await ViewHistory.create({
      userId,
      uploadId,
      viewedAt: new Date(),
    })

    // Track activity
    await UserActivity.create({
      userId,
      activityType: "upload_view",
      relatedId: uploadId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Track view error:", error)
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
  }
}
