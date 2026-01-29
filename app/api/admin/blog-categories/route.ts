export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import BlogCategory from "@/models/BlogCategory"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const categories = await BlogCategory.find().sort({ order: 1, name: 1 })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Blog categories GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    await dbConnect()

    if (!body.slug && body.name) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }

    const category = await BlogCategory.create(body)

    return NextResponse.json({ category }, { status: 201 })
  } catch (error: any) {
    console.error("Blog categories POST error:", error)
    if (error.code === 11000) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
