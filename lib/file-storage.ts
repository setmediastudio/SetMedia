import { writeFile, mkdir, unlink } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { uploadToR2, deleteFromR2, validateFile as validateR2File, generateUniqueFileName } from "./r2-storage"

export interface StorageResult {
  key: string
  url: string
  size: number
  type: string
  bucket: string
  storageType: "r2" | "local"
}

// Check if R2 is configured
function isR2Configured(): boolean {
  return !!(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_IMAGE_BUCKET_NAME &&
    process.env.R2_IMAGE_PUBLIC_URL
  )
}

/**
 * Upload file to R2 or local storage based on configuration
 */
export async function uploadFile(file: Buffer, fileName: string, contentType: string): Promise<StorageResult> {
  const useR2 = isR2Configured()

  if (useR2) {
    try {
      const result = await uploadToR2(file, fileName, contentType)
      return {
        ...result,
        storageType: "r2",
      }
    } catch (error) {
      console.error("[v0] R2 upload failed, falling back to local storage:", error)
      // Fall through to local storage
    }
  }

  // Local storage fallback
  const uploadsDir = path.join(process.cwd(), "public", "uploads")
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
  }

  const uniqueFileName = generateUniqueFileName(fileName)
  const filePath = path.join(uploadsDir, uniqueFileName)

  await writeFile(filePath, file)

  const isVideo = contentType.startsWith("video/")
  const bucket = isVideo ? "videos" : "images"

  return {
    key: uniqueFileName,
    url: `/uploads/${uniqueFileName}`,
    size: file.length,
    type: contentType,
    bucket,
    storageType: "local",
  }
}

/**
 * Delete file from R2 or local storage
 */
export async function deleteFile(key: string, bucket: string, storageType: "r2" | "local" = "local"): Promise<void> {
  if (storageType === "r2" && isR2Configured()) {
    try {
      await deleteFromR2(key, bucket)
      return
    } catch (error) {
      console.error("[v0] R2 delete failed:", error)
    }
  }

  // Local storage delete
  try {
    const filePath = path.join(process.cwd(), "public", "uploads", key)
    if (existsSync(filePath)) {
      await unlink(filePath)
    }
  } catch (error) {
    console.error("[v0] Local file delete failed:", error)
  }
}

/**
 * Validate file type and size
 */
export function validateFile(file: File, maxSizeMB = 100): { valid: boolean; error?: string } {
  return validateR2File(file, maxSizeMB)
}

export { generateUniqueFileName }
