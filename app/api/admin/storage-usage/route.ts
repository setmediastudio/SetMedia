export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Upload from "@/models/Upload"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const usage = await Upload.aggregate([
      {
        $group: {
          _id: null,
          hdUsed: { $sum: { $ifNull: ["$fileSize", 0] } },
          sdUsed: { $sum: { $ifNull: ["$sdFileSize", 0] } },
          uploadsCount: { $sum: 1 },
        },
      },
    ])

    const hdUsed = usage[0]?.hdUsed || 0
    const sdUsed = usage[0]?.sdUsed || 0
    const totalSize = hdUsed + sdUsed

    // 10GB free tier limit in bytes
    const totalLimit = 10737418240
    const available = Math.max(totalLimit - totalSize, 0)
    const response = NextResponse.json({
      used: totalSize,
      usedHd: hdUsed,
      usedSd: sdUsed,
      total: totalLimit,
      available,
      uploadsCount: usage[0]?.uploadsCount || 0,
      percentage: totalLimit > 0 ? (totalSize / totalLimit) * 100 : 0,
      source: "database",
    })

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    return response
  } catch (error) {
    console.error("Storage usage API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
