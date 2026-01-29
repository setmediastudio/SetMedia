export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import BlogPost from "@/models/BlogPost"
import { getUserObjectId } from "@/lib/admin-helper"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const categoryId = searchParams.get("category")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    await dbConnect()

    const query: any = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { "author.name": { $regex: search, $options: "i" } },
      ]
    }

    if (categoryId && categoryId !== "all") {
      query.category = categoryId
    }

    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .populate("category", "name slug")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BlogPost.countDocuments(query),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin blog GET error:", error)
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

    const userId = getUserObjectId(session.user.id)

    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    const post = await BlogPost.create({
      ...body,
      slug,
      createdBy: userId,
    })

    const populatedPost = await BlogPost.findById(post._id)
      .populate("category", "name slug")
      .populate("createdBy", "name email")

    return NextResponse.json({ post: populatedPost }, { status: 201 })
  } catch (error) {
    console.error("Admin blog POST error:", error)
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 })
  }
}
