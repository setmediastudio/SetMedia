export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import BlogPost from "@/models/BlogPost"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    await dbConnect()

    const post = await BlogPost.findByIdAndUpdate(params.id, body, { new: true })
      .populate("category", "name slug")
      .populate("createdBy", "name email")

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Admin blog PATCH error:", error)
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const post = await BlogPost.findByIdAndDelete(params.id)

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Blog post deleted successfully" })
  } catch (error) {
    console.error("Admin blog DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 })
  }
}
