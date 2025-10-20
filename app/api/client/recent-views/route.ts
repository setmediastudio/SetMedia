import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import ViewHistory from "@/models/ViewHistory"
import { getUserObjectId } from "@/lib/admin-helper"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userId = getUserObjectId(session.user.id)

    // Get last 6 viewed uploads
    const recentViews = await ViewHistory.find({ userId }).sort({ viewedAt: -1 }).limit(6).populate("uploadId").lean()

    const uploads = recentViews
      .filter((view: any) => view.uploadId)
      .map((view: any) => ({
        id: view.uploadId._id.toString(),
        title: view.uploadId.title || view.uploadId.originalName,
        thumbnail: view.uploadId.sdPublicUrl || view.uploadId.publicUrl,
        viewedAt: view.viewedAt,
        fileType: view.uploadId.fileType,
      }))

    return NextResponse.json(uploads)
  } catch (error) {
    console.error("Recent views error:", error)
    return NextResponse.json({ error: "Failed to fetch recent views" }, { status: 500 })
  }
}
