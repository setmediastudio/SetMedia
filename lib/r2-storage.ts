import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NodeHttpHandler } from "@aws-sdk/node-http-handler"
import https from "https"

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  timeout: 30000,
  minVersion: "TLSv1.2",
  maxVersion: "TLSv1.3",
})

const cleanEndpoint = (endpoint: string | undefined): string | undefined => {
  if (!endpoint) return endpoint
  return endpoint.replace(/^https?:\/\//, "")
}

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${cleanEndpoint(process.env.R2_ENDPOINT)}`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
  requestHandler: new NodeHttpHandler({
    httpsAgent,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  }),
})

const IMAGE_BUCKET_NAME = process.env.R2_IMAGE_BUCKET_NAME || ""
const VIDEO_BUCKET_NAME = process.env.R2_VIDEO_BUCKET_NAME || ""
const IMAGE_PUBLIC_URL = process.env.R2_IMAGE_PUBLIC_URL || ""
const VIDEO_PUBLIC_URL = process.env.R2_VIDEO_PUBLIC_URL || ""

export interface UploadResult {
  key: string
  url: string
  size: number
  type: string
  bucket: string
}

function isVideoFile(contentType: string): boolean {
  return contentType.startsWith("video/")
}

function getBucketConfig(contentType: string): { bucket: string; publicUrl: string } {
  if (isVideoFile(contentType)) {
    return { bucket: VIDEO_BUCKET_NAME, publicUrl: VIDEO_PUBLIC_URL }
  }
  return { bucket: IMAGE_BUCKET_NAME, publicUrl: IMAGE_PUBLIC_URL }
}

/**
 * Upload a file to Cloudflare R2 (automatically routes to correct bucket)
 */
export async function uploadToR2(file: Buffer, fileName: string, contentType: string): Promise<UploadResult> {
  const { bucket, publicUrl } = getBucketConfig(contentType)
  const key = `uploads/${Date.now()}-${fileName}`

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file,
    ContentType: contentType,
  })

  await r2Client.send(command)

  return {
    key,
    url: `${publicUrl}/${key}`,
    size: file.length,
    type: contentType,
    bucket,
  }
}

/**
 * Delete a file from Cloudflare R2
 */
export async function deleteFromR2(key: string, bucket: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  })

  await r2Client.send(command)
}

/**
 * Generate a signed URL for temporary access to a private file
 */
export async function getSignedR2Url(key: string, bucket: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  })

  return await getSignedUrl(r2Client, command, { expiresIn })
}

/**
 * Validate file type and size
 */
export function validateFile(file: File, maxSizeMB = 100): { valid: boolean; error?: string } {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/webm",
  ]

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported. Allowed types: JPG, PNG, GIF, WEBP, MP4, MOV, WEBM`,
    }
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }

  return { valid: true }
}

/**
 * Generate a unique file name to prevent collisions
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split(".").pop()
  const nameWithoutExt = originalName.replace(`.${extension}`, "").replace(/[^a-zA-Z0-9]/g, "-")

  return `${nameWithoutExt}-${timestamp}-${randomString}.${extension}`
}
