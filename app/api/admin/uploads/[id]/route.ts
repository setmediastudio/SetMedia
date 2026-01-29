export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Upload from "@/models/Upload"
import { deleteFromR2 } from "@/lib/r2-storage"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const upload = await Upload.findById(params.id).populate("uploadedBy", "name email")

    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 })
    }

    return NextResponse.json({ upload })
  } catch (error) {
    console.error("Get upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, tags, portfolioCategory } = await request.json()

    await dbConnect()

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (tags !== undefined) updateData.tags = tags
    if (portfolioCategory !== undefined) {
      updateData.portfolioCategory = portfolioCategory === "none" ? null : portfolioCategory
    }

    const upload = await Upload.findByIdAndUpdate(params.id, updateData, { new: true }).populate(
      "portfolioCategory",
      "name slug",
    )

    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 })
    }

    return NextResponse.json({ upload })
  } catch (error) {
    console.error("Update upload error:", error)
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

    const upload = await Upload.findById(params.id)

    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 })
    }

    // Delete from R2
    await deleteFromR2(upload.storageKey, upload.bucket)

    // Delete from database
    await Upload.findByIdAndDelete(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
