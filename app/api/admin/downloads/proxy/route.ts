import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Upload from "@/models/Upload"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only authenticated users can download
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("[v0] Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { uploadId, quality, fileName } = body

    if (!uploadId || !quality) {
      return NextResponse.json(
        { error: "Missing required parameters: uploadId and quality" },
        { status: 400 },
      )
    }

    await dbConnect()

    const upload = await Upload.findById(uploadId)

    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 })
    }

    // Determine which URL to use based on quality
    let downloadUrl: string
    let fileSize: number

    if (quality === "sd") {
      // Try SD version first, fallback to public URL if not available
      if (upload.sdPublicUrl) {
        downloadUrl = upload.sdPublicUrl
        fileSize = upload.sdFileSize || 0
      } else if (upload.publicUrl) {
        downloadUrl = upload.publicUrl
        fileSize = upload.fileSize || 0
      } else {
        return NextResponse.json(
          { error: "SD version not available, please download HD instead" },
          { status: 404 },
        )
      }
    } else {
      // HD quality - use public URL
      if (!upload.publicUrl) {
        return NextResponse.json(
          { error: "File URL not available" },
          { status: 404 },
        )
      }
      downloadUrl = upload.publicUrl
      fileSize = upload.fileSize || 0
    }

    // Fetch the file from the storage URL
    let fileResponse
    try {
      fileResponse = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          "Accept": "*/*",
        },
      })

      if (!fileResponse.ok) {
        console.error(`[v0] Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`)
        return NextResponse.json(
          { error: `Failed to retrieve file: ${fileResponse.statusText}` },
          { status: 500 },
        )
      }
    } catch (fetchError) {
      console.error("[v0] Failed to fetch file from storage:", fetchError)
      return NextResponse.json(
        { error: "Failed to retrieve file from storage" },
        { status: 500 },
      )
    }

    // Get the file buffer
    let fileBuffer
    try {
      fileBuffer = await fileResponse.arrayBuffer()
    } catch (bufferError) {
      console.error("[v0] Failed to read file buffer:", bufferError)
      return NextResponse.json(
        { error: "Failed to process file" },
        { status: 500 },
      )
    }

    if (!fileBuffer || fileBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: "File is empty or corrupted" },
        { status: 400 },
      )
    }

    const finalFileName = `${quality === "sd" ? "[SD]" : "[HD]"}-${fileName}`
    
    // Return file directly as blob
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": fileResponse.headers.get("Content-Type") || "application/octet-stream",
        "Content-Length": fileBuffer.byteLength.toString(),
        "Content-Disposition": `attachment; filename="${finalFileName}"`,
      },
    })
  } catch (error) {
    console.error("[v0] Download proxy error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process download request" },
      { status: 500 },
    )
  }
}
