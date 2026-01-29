export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import PortfolioCategory from "@/models/PortfolioCategory"
import Upload from "@/models/Upload"

// Cache for 5 minutes (300 seconds)
export const revalidate = 300

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get("category")
    const mediaType = searchParams.get("type") // 'image' or 'video'
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 500

    await dbConnect()

    const allCategories = await PortfolioCategory.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean()

    // Transform categories to include parentCategoryId and parent name
    const categoriesFormatted = await Promise.all(
      allCategories.map(async (cat) => {
        let parentCategoryName: string | null = null
        if (cat.parentCategoryId) {
          const parentCat = allCategories.find((c) => c._id.toString() === cat.parentCategoryId.toString())
          if (parentCat) {
            parentCategoryName = parentCat.name
          }
        }

        return {
          _id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          order: cat.order,
          isActive: cat.isActive,
          parentCategoryId: cat.parentCategoryId ? cat.parentCategoryId.toString() : null,
          parentCategoryName,
        }
      }),
    )

    // Build hierarchical category structure with root-level categories
    const rootCategories = categoriesFormatted.filter((cat) => !cat.parentCategoryId)

    // Build query for uploads
    const uploadQuery: any = {
      status: "processed",
      portfolioCategory: { $exists: true, $ne: null },
    }

    // Filter by category if specified
    if (categorySlug && categorySlug !== "all") {
      const category = await PortfolioCategory.findOne({ slug: categorySlug, isActive: true })
      if (category) {
        const categoryIds = [category._id]

        // Fetch all sub-categories
        const subCategories = await PortfolioCategory.find({
          parentCategoryId: category._id,
          isActive: true,
        })

        subCategories.forEach((sub) => {
          categoryIds.push(sub._id)
        })

        uploadQuery.portfolioCategory = { $in: categoryIds }
      }
    }

    // Filter by media type if specified
    if (mediaType === "image") {
      uploadQuery.fileType = { $regex: "^image/" }
    } else if (mediaType === "video") {
      uploadQuery.fileType = { $regex: "^video/" }
    }

    // Fetch uploads with limit
    const uploads = await Upload.find(uploadQuery)
      .populate({
        path: "portfolioCategory",
        select: "name slug _id parentCategoryId",
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    // Format uploads to include category details and parent category name
    const formattedUploads = uploads.map((upload: any) => {
      const portfolioCategory = upload.portfolioCategory
      let parentCategoryName: string | null = null

      if (portfolioCategory?.parentCategoryId) {
        const parentCat = allCategories.find((c) =>
          c._id.toString() === portfolioCategory.parentCategoryId.toString(),
        )
        if (parentCat) {
          parentCategoryName = parentCat.name
        }
      }

      return {
        ...upload,
        _id: upload._id.toString(),
        portfolioCategory: portfolioCategory
          ? {
              _id: portfolioCategory._id?.toString() || portfolioCategory._id,
              name: portfolioCategory.name,
              slug: portfolioCategory.slug,
              parentCategoryId: portfolioCategory.parentCategoryId
                ? portfolioCategory.parentCategoryId.toString()
                : null,
              parentCategoryName,
            }
          : null,
        uploadedBy: upload.uploadedBy?.toString(),
        createdAt: upload.createdAt,
        updatedAt: upload.updatedAt,
      }
    })

    const response = NextResponse.json({
      categories: rootCategories,
      allCategories: categoriesFormatted,
      uploads: formattedUploads,
    })

    // Add caching headers
    response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=3600")
    response.headers.set("CDN-Cache-Control", "max-age=300")

    return response
  } catch (error) {
    console.error("Portfolio API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
