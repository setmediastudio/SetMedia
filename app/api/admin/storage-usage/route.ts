export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize S3 client for Cloudflare R2
    const s3Client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    })

    let totalSize = 0
    const buckets = [process.env.R2_IMAGE_BUCKET_NAME, process.env.R2_VIDEO_BUCKET_NAME].filter(Boolean)

    // Calculate total storage used across all buckets
    for (const bucket of buckets) {
      let continuationToken: string | undefined = undefined

      do {
        const command = new ListObjectsV2Command({
          Bucket: bucket,
          ContinuationToken: continuationToken,
        })

        const response = await s3Client.send(command)

        if (response.Contents) {
          for (const object of response.Contents) {
            totalSize += object.Size || 0
          }
        }

        continuationToken = response.NextContinuationToken
      } while (continuationToken)
    }

    // 10GB free tier limit in bytes
    const totalLimit = 10737418240

    return NextResponse.json({
      used: totalSize,
      total: totalLimit,
      available: totalLimit - totalSize,
      percentage: (totalSize / totalLimit) * 100,
    })
  } catch (error) {
    console.error("Storage usage API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
