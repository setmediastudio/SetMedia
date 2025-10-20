import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Gallery from "@/models/Gallery"
import { checkGalleryAccess } from "@/lib/access-control"
import { getSignedR2Url } from "@/lib/r2-storage"
import { getUserObjectId } from "@/lib/admin-helper"

export async function GET(request: NextRequest, { params }: { params: { galleryId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const { galleryId } = params

    await dbConnect()

    const gallery = await Gallery.findById(galleryId).populate("uploads")

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 })
    }

    // Check if downloads are enabled
    if (!gallery.downloadEnabled) {
      return NextResponse.json({ error: "Downloads are not enabled for this gallery" }, { status: 403 })
    }

    // Check access
    const userId = session ? getUserObjectId(session.user.id) : undefined
    const accessCheck = await checkGalleryAccess(galleryId, userId)

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

    // Generate signed URLs for all uploads in the gallery
    const downloadLinks = await Promise.all(
      gallery.uploads.map(async (upload: any) => {
        const signedUrl = await getSignedR2Url(upload.storageKey, upload.bucket, 3600)
        return {
          id: upload._id,
          fileName: upload.originalName,
          fileType: upload.fileType,
          downloadUrl: signedUrl,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      galleryTitle: gallery.title,
      downloads: downloadLinks,
      expiresIn: 3600,
    })
  } catch (error) {
    console.error("Gallery download error:", error)
    return NextResponse.json({ error: "Failed to generate download links" }, { status: 500 })
  }
}
