export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Upload from "@/models/Upload"
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

    if (search) {
      query.$or = [
        { fileName: { $regex: search, $options: "i" } },
        { originalName: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    if (status && status !== "all") {
      query.status = status
    }

    const uploads = await Upload.find(query)
      .populate("uploadedBy", "name email")
      .populate("portfolioCategory", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Upload.countDocuments(query)

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
    console.error("Admin uploads API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const tags = formData.get("tags") as string
    const portfolioCategory = formData.get("portfolioCategory") as string
    const isGalleryItem = formData.get("isGalleryItem") === "true"
    const galleryId = formData.get("galleryId") as string
    const hdPrice = formData.get("hdPrice") ? Number.parseFloat(formData.get("hdPrice") as string) : 0

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const { validateFile, generateUniqueFileName, uploadFile } = await import("@/lib/file-storage")
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const uniqueFileName = generateUniqueFileName(file.name)

    const uploadResult = await uploadFile(buffer, uniqueFileName, file.type)

    console.log("[v0] HD Upload successful:", {
      fileName: uniqueFileName,
      url: uploadResult.url,
      storageType: uploadResult.storageType,
    })

    let sdUploadResult = null
    const { isCompressibleImage, compressImage, generateSDFileName } = await import("@/lib/media-compression")

    if (isCompressibleImage(file.type)) {
      try {
        const sdBuffer = await compressImage(buffer, file.type)
        const sdFileName = generateSDFileName(uniqueFileName)
        sdUploadResult = await uploadFile(sdBuffer, sdFileName, file.type)

        console.log("[v0] SD Upload successful:", {
          fileName: sdFileName,
          url: sdUploadResult.url,
          originalSize: file.size,
          compressedSize: sdBuffer.length,
          compressionRatio: ((1 - sdBuffer.length / file.size) * 100).toFixed(2) + "%",
        })
      } catch (error) {
        console.error("[v0] SD compression failed:", error)
        // Continue without SD version if compression fails
      }
    }

    // Save to database
    await dbConnect()

    const upload = await Upload.create({
      uploadedBy: getUserObjectId(session.user.id),
      fileName: uniqueFileName,
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type,
      storageKey: uploadResult.key,
      publicUrl: uploadResult.url,
      bucket: uploadResult.bucket,
      sdStorageKey: sdUploadResult?.key,
      sdPublicUrl: sdUploadResult?.url,
      sdFileSize: sdUploadResult?.size,
      title: title || undefined,
      description: description || undefined,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      portfolioCategory: portfolioCategory || undefined,
      isGalleryItem,
      hdPrice: hdPrice || 0,
      isPaid: hdPrice > 0,
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
        sdUrl: upload.sdPublicUrl,
        size: upload.fileSize,
        sdSize: upload.sdFileSize,
        type: upload.fileType,
        hdPrice: upload.hdPrice,
      },
    })
  } catch (error) {
    console.error("Admin upload error:", error)
    return NextResponse.json(
      {
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
