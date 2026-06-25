export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import mongoose from "mongoose"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import PortfolioCategory from "@/models/PortfolioCategory"
import Upload from "@/models/Upload"
import { deleteUploadRecordsByIds, deleteUploadAssetsBatch, runTransactionWithRetry } from "@/lib/upload-cleanup"

async function getCategoryTreeIds(rootCategoryId: string): Promise<string[]> {
  const categoryIds = new Set<string>([rootCategoryId])
  const queue = [rootCategoryId]

  while (queue.length > 0) {
    const parentCategoryId = queue.shift()
    if (!parentCategoryId) continue

    const children = (await PortfolioCategory.find({ parentCategoryId }).select("_id").lean()) as Array<{
      _id: mongoose.Types.ObjectId
    }>

    for (const child of children) {
      const childId = child._id.toString()
      if (categoryIds.has(childId)) continue

      categoryIds.add(childId)
      queue.push(childId)
    }
  }

  return [...categoryIds]
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, order, isActive, parentCategoryId } = await request.json()

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
    if (parentCategoryId !== undefined) {
      if (parentCategoryId) {
        const parentCategory = await PortfolioCategory.findById(parentCategoryId)
        if (!parentCategory) {
          return NextResponse.json({ error: "Parent category not found" }, { status: 400 })
        }
      }
      updateData.parentCategoryId = parentCategoryId || null
    }

    const category = await PortfolioCategory.findByIdAndUpdate(params.id, updateData, { new: true }).populate(
      "parentCategoryId",
      "name slug",
    )

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

    const category = await PortfolioCategory.findById(params.id).select("_id")

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const categoryIds = await getCategoryTreeIds(params.id)
    const uploads = await Upload.find({ portfolioCategory: { $in: categoryIds } })
    await deleteUploadAssetsBatch(uploads)

    const uploadIds = uploads.map((upload) => upload._id as mongoose.Types.ObjectId)
    await runTransactionWithRetry(async (dbSession) => {
      await deleteUploadRecordsByIds(uploadIds, dbSession)
      await PortfolioCategory.deleteMany({ _id: { $in: categoryIds } }, { session: dbSession })
    })

    return NextResponse.json({
      success: true,
      deleted: {
        categories: categoryIds.length,
        uploads: uploads.length,
      },
    })
  } catch (error) {
    console.error("Portfolio category deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
