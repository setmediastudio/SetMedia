import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Upload from "@/models/Upload"
import { checkUploadAccess } from "@/lib/access-control"
import { getSignedR2Url } from "@/lib/r2-storage"
import { getUserObjectId } from "@/lib/admin-helper"

export async function GET(request: NextRequest, { params }: { params: { uploadId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const { uploadId } = params

    await dbConnect()

    const upload = await Upload.findById(uploadId)

    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 })
    }

    // Check access
    const userId = session ? getUserObjectId(session.user.id) : undefined
    const accessCheck = await checkUploadAccess(uploadId, userId)

    if (!accessCheck.hasAccess) {
      if (accessCheck.requiresPayment) {
        return NextResponse.json(
          {
            error: "Payment required",
            requiresPayment: true,
            price: accessCheck.price,
          },
          { status: 403 },
        )
      }

      return NextResponse.json({ error: accessCheck.reason || "Access denied" }, { status: 403 })
    }

    // Generate signed URL for secure download (expires in 1 hour)
    const signedUrl = await getSignedR2Url(upload.storageKey, upload.bucket, 3600)

    return NextResponse.json({
      success: true,
      downloadUrl: signedUrl,
      fileName: upload.originalName,
      fileType: upload.fileType,
      expiresIn: 3600,
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 })
  }
}
