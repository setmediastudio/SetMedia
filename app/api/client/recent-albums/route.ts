export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Gallery from "@/models/Gallery"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get recent galleries/albums for the current user
    const recentAlbums = await Gallery.find({ userId: session.user?.id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean()

    // Transform the data to match the expected format
    const formattedAlbums = recentAlbums.map((album) => ({
      id: album._id.toString(),
      title: album.title || "Untitled Gallery",
      type: album.type || "Photography",
      status: album.status || "pending",
      thumbnail: album.thumbnail || "/photo-gallery.png",
      createdAt: getRelativeTime(album.createdAt),
      photoCount: album.photoCount || 0,
    }))

    return NextResponse.json(formattedAlbums)
  } catch (error) {
    console.error("Error fetching recent albums:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return "Today"
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? "s" : ""} ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? "s" : ""} ago`

  return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? "s" : ""} ago`
}
