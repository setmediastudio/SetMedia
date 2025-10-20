export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Gallery from "@/models/Gallery"
import Upload from "@/models/Upload"
import { getUserObjectId } from "@/lib/admin-helper"
import { validateFile, generateUniqueFileName, uploadFile } from "@/lib/file-storage"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    await dbConnect()

    const gallery = await Gallery.findById(params.id)
    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 })
    }

    const uploadedFiles = []

    for (const file of files) {
      const validation = validateFile(file)
      if (!validation.valid) {
        continue
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uniqueFileName = generateUniqueFileName(file.name)

      const uploadResult = await uploadFile(buffer, uniqueFileName, file.type)

      const upload = await Upload.create({
        uploadedBy: getUserObjectId(session.user.id),
        fileName: uniqueFileName,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        storageKey: uploadResult.key,
        publicUrl: uploadResult.url,
        bucket: uploadResult.bucket,
        isGalleryItem: true,
        status: "processed",
        metadata: {
          storageType: uploadResult.storageType,
        },
      })

      gallery.uploads.push(upload._id)
      uploadedFiles.push(upload)
    }

    await gallery.save()

    return NextResponse.json({
      success: true,
      uploads: uploadedFiles,
      count: uploadedFiles.length,
    })
  } catch (error) {
    console.error("Gallery upload error:", error)
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 })
  }
}
