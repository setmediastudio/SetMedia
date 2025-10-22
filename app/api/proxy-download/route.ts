export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter required" }, { status: 400 })
    }

    console.log("[v0] Proxying download for:", url)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`)
    }

    const blob = await response.blob()

    return new NextResponse(blob, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/octet-stream",
        "Content-Disposition": "attachment",
      },
    })
  } catch (error) {
    console.error("[v0] Proxy download error:", error)
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
  }
}
