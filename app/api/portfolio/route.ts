export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import PortfolioCategory from "@/models/PortfolioCategory"
import Upload from "@/models/Upload"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get("category")
    const mediaType = searchParams.get("type") // 'image' or 'video'

    await dbConnect()

    // Get all active categories
    const categories = await PortfolioCategory.find({ isActive: true }).sort({ order: 1, name: 1 })

    // Build query for uploads
    const uploadQuery: any = {
      status: "processed",
      portfolioCategory: { $exists: true, $ne: null },
    }

    // Filter by category if specified
    if (categorySlug && categorySlug !== "all") {
      const category = await PortfolioCategory.findOne({ slug: categorySlug, isActive: true })
      if (category) {
        uploadQuery.portfolioCategory = category._id
      }
    }

    // Filter by media type if specified
    if (mediaType === "image") {
      uploadQuery.fileType = { $regex: "^image/" }
    } else if (mediaType === "video") {
      uploadQuery.fileType = { $regex: "^video/" }
    }

    const uploads = await Upload.find(uploadQuery)
      .populate("portfolioCategory", "name slug")
      .sort({ createdAt: -1 })
      .limit(100)

    return NextResponse.json({
      categories,
      uploads,
    })
  } catch (error) {
    console.error("Portfolio API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
