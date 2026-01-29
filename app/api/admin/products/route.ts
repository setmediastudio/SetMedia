import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Product from "@/models/Product"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""
    const category = searchParams.get("category") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    await dbConnect()

    // Build query
    const query: any = {}

    if (type && type !== "all") {
      query.type = type
    }

    if (category && category !== "all") {
      query.category = category
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Product.countDocuments(query)

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin products API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const productData = await request.json()

    if (!productData.title || !productData.description || !productData.price) {
      return NextResponse.json({ error: "Title, description, and price are required" }, { status: 400 })
    }

    await dbConnect()

    const product = await Product.create(productData)

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Product creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
