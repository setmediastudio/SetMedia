import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import RecycleBin from "@/models/RecycleBin"
import Upload from "@/models/Upload"
import User from "@/models/User"
import Booking from "@/models/Booking"
import Gallery from "@/models/Gallery"
import Product from "@/models/Product"
import Order from "@/models/Order"

const MODEL_MAP = {
  upload: Upload,
  user: User,
  booking: Booking,
  gallery: Gallery,
  product: Product,
  order: Order,
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const resourceType = searchParams.get("resourceType")
    const search = searchParams.get("search")

    await connectDB()

    const filter: any = {}
    if (resourceType) filter.resourceType = resourceType
    if (search) {
      filter.$or = [
        { "originalData.name": { $regex: search, $options: "i" } },
        { "originalData.title": { $regex: search, $options: "i" } },
        { "originalData.email": { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
      ]
    }

    const items = await RecycleBin.find(filter)
      .populate("deletedBy", "name email")
      .sort({ deletedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await RecycleBin.countDocuments(filter)

    // Get statistics
    const stats = await RecycleBin.aggregate([
      {
        $group: {
          _id: "$resourceType",
          count: { $sum: 1 },
        },
      },
    ])

    return NextResponse.json({
      items,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Recycle bin fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { itemIds, action } = body

    await connectDB()

    if (action === "restore") {
      const items = await RecycleBin.find({ _id: { $in: itemIds } })

      const restorePromises = items.map(async (item) => {
        const Model = MODEL_MAP[item.resourceType as keyof typeof MODEL_MAP]
        if (!Model) return

        // Restore the original data
        const restoredItem = new Model(item.originalData)
        await restoredItem.save()

        // Remove from recycle bin
        await RecycleBin.findByIdAndDelete(item._id)
      })

      await Promise.all(restorePromises)

      return NextResponse.json({
        message: "Items restored successfully",
        count: items.length,
      })
    }

    if (action === "permanentDelete") {
      await RecycleBin.deleteMany({ _id: { $in: itemIds } })

      return NextResponse.json({
        message: "Items permanently deleted",
        count: itemIds.length,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Recycle bin action error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
