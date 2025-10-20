export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import BlogCategory from "@/models/BlogCategory"
import BlogPost from "@/models/BlogPost"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get("category")

    await dbConnect()

    // Get all active categories
    const categories = await BlogCategory.find({ isActive: true }).sort({ order: 1, name: 1 })

    // Build query for blog posts
    const postQuery: any = {
      isPublished: true,
    }

    // Filter by category if specified
    if (categorySlug && categorySlug !== "all") {
      const category = await BlogCategory.findOne({ slug: categorySlug, isActive: true })
      if (category) {
        postQuery.category = category._id
      }
    }

    const posts = await BlogPost.find(postQuery)
      .populate("category", "name slug")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(100)

    return NextResponse.json({
      categories,
      posts,
    })
  } catch (error) {
    console.error("Blog API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
