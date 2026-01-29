export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Gallery from "@/models/Gallery"
import { getUserObjectId } from "@/lib/admin-helper"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    await dbConnect()

    // Build query
    const query: any = {}

    if (status && status !== "all") {
      query.status = status
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    const galleries = await Gallery.find(query)
      .populate("createdBy", "name email")
      .populate("uploads", "fileName originalName fileType")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Gallery.countDocuments(query)

    return NextResponse.json({
      galleries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin galleries API error:", error)
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
    const { title, description, isPublic, allowDownload, allowedClients, tags } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    await dbConnect()

    const gallery = await Gallery.create({
      title,
      description: description || "",
      createdBy: getUserObjectId(session.user.id),
      isPublic: isPublic ?? true,
      downloadEnabled: allowDownload ?? true,
      allowedClients: allowedClients || [],
      tags: tags || [],
      uploads: [],
      status: "active",
    })

    return NextResponse.json({
      success: true,
      gallery: {
        id: gallery._id,
        title: gallery.title,
        description: gallery.description,
        isPublic: gallery.isPublic,
      },
    })
  } catch (error) {
    console.error("Create gallery error:", error)
    return NextResponse.json(
      {
        error: "Failed to create gallery",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
