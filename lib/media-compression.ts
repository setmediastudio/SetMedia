import sharp from "sharp"

/**
 * Compress image to 50% quality for SD version
 */
export async function compressImage(buffer: Buffer, contentType: string): Promise<Buffer> {
  const image = sharp(buffer)
  const metadata = await image.metadata()

  const targetWidth = Math.floor((metadata.width || 1920) * 0.5)

  if (contentType === "image/png") {
    return await image.resize(targetWidth).png({ quality: 50, compressionLevel: 9 }).toBuffer()
  } else if (contentType === "image/webp") {
    return await image.resize(targetWidth).webp({ quality: 50 }).toBuffer()
  } else {
    // Default to JPEG for other formats
    return await image.resize(targetWidth).jpeg({ quality: 50 }).toBuffer()
  }
}

/**
 * Check if file is an image that can be compressed
 */
export function isCompressibleImage(contentType: string): boolean {
  return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(contentType)
}

/**
 * Check if file is a video
 */
export function isVideo(contentType: string): boolean {
  return contentType.startsWith("video/")
}

/**
 * Generate SD filename from HD filename
 */
export function generateSDFileName(hdFileName: string): string {
  const parts = hdFileName.split(".")
  const extension = parts.pop()
  const nameWithoutExt = parts.join(".")
  return `${nameWithoutExt}-sd.${extension}`
}
