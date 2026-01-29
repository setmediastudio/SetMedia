import type mongoose from "mongoose"
import Gallery from "@/models/Gallery"
import Upload from "@/models/Upload"

export interface AccessCheckResult {
  hasAccess: boolean
  reason?: string
  requiresPayment?: boolean
  price?: number
}

/**
 * Check if a user has access to a gallery
 */
export async function checkGalleryAccess(
  galleryId: string | mongoose.Types.ObjectId,
  userId?: string | mongoose.Types.ObjectId,
): Promise<AccessCheckResult> {
  try {
    const gallery = await Gallery.findById(galleryId)

    if (!gallery) {
      return { hasAccess: false, reason: "Gallery not found" }
    }

    // Public galleries are accessible to everyone
    if (gallery.isPublic && !gallery.isPaid) {
      return { hasAccess: true }
    }

    // User must be logged in for non-public galleries
    if (!userId) {
      if (gallery.isPaid) {
        return {
          hasAccess: false,
          reason: "Payment required",
          requiresPayment: true,
          price: gallery.price,
        }
      }
      return { hasAccess: false, reason: "Login required" }
    }

    const userIdStr = userId.toString()
    const creatorIdStr = gallery.createdBy.toString()

    // Creator always has access
    if (userIdStr === creatorIdStr) {
      return { hasAccess: true }
    }

    // Check if user is in allowed clients list
    const isAllowedClient = gallery.allowedClients.some((clientId) => clientId.toString() === userIdStr)

    if (isAllowedClient) {
      return { hasAccess: true }
    }

    // Check if gallery requires payment
    if (gallery.isPaid) {
      const hasPaid = gallery.paidUsers.some((paidUserId) => paidUserId.toString() === userIdStr)

      if (hasPaid) {
        return { hasAccess: true }
      }

      return {
        hasAccess: false,
        reason: "Payment required",
        requiresPayment: true,
        price: gallery.price,
      }
    }

    return { hasAccess: false, reason: "Access denied" }
  } catch (error) {
    console.error("Gallery access check error:", error)
    return { hasAccess: false, reason: "Error checking access" }
  }
}

/**
 * Check if a user has access to an upload
 */
export async function checkUploadAccess(
  uploadId: string | mongoose.Types.ObjectId,
  userId?: string | mongoose.Types.ObjectId,
): Promise<AccessCheckResult> {
  try {
    const upload = await Upload.findById(uploadId)

    if (!upload) {
      return { hasAccess: false, reason: "Upload not found" }
    }

    // User must be logged in
    if (!userId) {
      if (upload.isPaid) {
        return {
          hasAccess: false,
          reason: "Payment required",
          requiresPayment: true,
          price: upload.price,
        }
      }
      return { hasAccess: false, reason: "Login required" }
    }

    const userIdStr = userId.toString()
    const uploaderIdStr = upload.uploadedBy.toString()

    // Uploader always has access
    if (userIdStr === uploaderIdStr) {
      return { hasAccess: true }
    }

    // Check if user is assigned
    const isAssigned = upload.assignedUsers.some((assignedId) => assignedId.toString() === userIdStr)

    if (isAssigned) {
      return { hasAccess: true }
    }

    // Check if upload requires payment
    if (upload.isPaid) {
      const hasPaid = upload.paidUsers.some((paidUserId) => paidUserId.toString() === userIdStr)

      if (hasPaid) {
        return { hasAccess: true }
      }

      return {
        hasAccess: false,
        reason: "Payment required",
        requiresPayment: true,
        price: upload.price,
      }
    }

    return { hasAccess: false, reason: "Access denied" }
  } catch (error) {
    console.error("Upload access check error:", error)
    return { hasAccess: false, reason: "Error checking access" }
  }
}

/**
 * Get all galleries accessible to a user
 */
export async function getUserAccessibleGalleries(userId: string | mongoose.Types.ObjectId) {
  try {
    const userIdStr = userId.toString()

    const galleries = await Gallery.find({
      $or: [
        { isPublic: true, isPaid: false },
        { createdBy: userId },
        { allowedClients: userId },
        { paidUsers: userId },
      ],
      status: "active",
    })
      .populate("uploads")
      .sort({ createdAt: -1 })

    return galleries
  } catch (error) {
    console.error("Error fetching accessible galleries:", error)
    return []
  }
}

/**
 * Get all uploads accessible to a user
 */
export async function getUserAccessibleUploads(userId: string | mongoose.Types.ObjectId) {
  try {
    const uploads = await Upload.find({
      $or: [{ uploadedBy: userId }, { assignedUsers: userId }, { paidUsers: userId }],
      status: "processed",
    }).sort({ createdAt: -1 })

    return uploads
  } catch (error) {
    console.error("Error fetching accessible uploads:", error)
    return []
  }
}
