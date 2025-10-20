export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import PortfolioCategory from "@/models/PortfolioCategory"
import Upload from "@/models/Upload"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, order, isActive } = await request.json()

    await dbConnect()

    const updateData: any = {}
    if (name) {
      updateData.name = name
      updateData.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    }
    if (description !== undefined) updateData.description = description
    if (order !== undefined) updateData.order = order
    if (isActive !== undefined) updateData.isActive = isActive

    const category = await PortfolioCategory.findByIdAndUpdate(params.id, updateData, { new: true })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error("Portfolio category update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Check if category has uploads
    const uploadsCount = await Upload.countDocuments({ portfolioCategory: params.id })
    if (uploadsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${uploadsCount} uploads. Please reassign or delete uploads first.` },
        { status: 400 },
      )
    }

    const category = await PortfolioCategory.findByIdAndDelete(params.id)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Portfolio category deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
