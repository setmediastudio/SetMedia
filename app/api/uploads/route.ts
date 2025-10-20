import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Upload from "@/models/Upload"
import { uploadFile, validateFile, generateUniqueFileName, deleteFile } from "@/lib/file-storage"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const tags = formData.get("tags") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const uniqueFileName = generateUniqueFileName(file.name)

    console.log("[v0] Starting upload:", {
      fileName: uniqueFileName,
      fileType: file.type,
      fileSize: file.size,
    })

    const uploadResult = await uploadFile(buffer, uniqueFileName, file.type)

    console.log("[v0] Upload successful:", uploadResult)

    // Save to database
    await dbConnect()

    const upload = await Upload.create({
      userId: session.user.id,
      fileName: uniqueFileName,
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type,
      storageKey: uploadResult.key,
      publicUrl: uploadResult.url,
      bucket: uploadResult.bucket,
      title: title || undefined,
      description: description || undefined,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      status: "processed",
      metadata: {
        storageType: uploadResult.storageType,
      },
    })

    return NextResponse.json({
      success: true,
      upload: {
        id: upload._id,
        fileName: upload.fileName,
        originalName: upload.originalName,
        url: upload.publicUrl,
        size: upload.fileSize,
        type: upload.fileType,
        bucket: upload.bucket,
      },
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    console.error("[v0] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    await dbConnect()

    const uploads = await Upload.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Upload.countDocuments({ userId: session.user.id })

    return NextResponse.json({
      uploads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Fetch uploads error:", error)
    return NextResponse.json({ error: "Failed to fetch uploads" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get("id")

    if (!uploadId) {
      return NextResponse.json({ error: "Upload ID required" }, { status: 400 })
    }

    await dbConnect()

    const upload = await Upload.findOne({
      _id: uploadId,
      userId: session.user.id,
    })

    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 })
    }

    const storageType = upload.metadata?.storageType || "local"
    await deleteFile(upload.storageKey, upload.bucket, storageType)

    // Delete from database
    await Upload.deleteOne({ _id: uploadId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete upload error:", error)
    return NextResponse.json({ error: "Failed to delete upload" }, { status: 500 })
  }
}
