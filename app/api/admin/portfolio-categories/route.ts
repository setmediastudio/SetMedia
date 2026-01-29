export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import PortfolioCategory from "@/models/PortfolioCategory"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const allCategories = await PortfolioCategory.find()
      .sort({ order: 1, name: 1 })
      .lean()

    // Format categories to ensure parentCategoryId is a string ID
    const categories = allCategories.map((cat) => ({
      _id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      order: cat.order,
      isActive: cat.isActive,
      parentCategoryId: cat.parentCategoryId ? cat.parentCategoryId.toString() : null,
    }))

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Portfolio categories API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, order, parentCategoryId } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    await dbConnect()

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    // Check if category already exists
    const existing = await PortfolioCategory.findOne({ slug })
    if (existing) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 })
    }

    if (parentCategoryId) {
      const parentCategory = await PortfolioCategory.findById(parentCategoryId)
      if (!parentCategory) {
        return NextResponse.json({ error: "Parent category not found" }, { status: 400 })
      }
    }

    const category = await PortfolioCategory.create({
      name,
      slug,
      description,
      order: order || 0,
      isActive: true,
      parentCategoryId: parentCategoryId || null,
    })

    await category.populate("parentCategoryId", "name slug")

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error("Portfolio category creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
