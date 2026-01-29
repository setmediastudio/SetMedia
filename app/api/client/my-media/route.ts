export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Upload from "@/models/Upload"
import { getUserObjectId } from "@/lib/admin-helper"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userId = getUserObjectId(session.user.id)

    const purchasedMedia = await Upload.find({
      paidUsers: userId,
    })
      .populate("portfolioCategory", "name slug")
      .sort({ createdAt: -1 })

    return NextResponse.json({ media: purchasedMedia })
  } catch (error) {
    console.error("My media API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
