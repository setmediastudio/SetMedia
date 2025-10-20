export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import SystemSettings from "@/models/SystemSettings"
import { getUserObjectId } from "@/lib/admin-helper"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    await connectDB()

    const settingsToUpdate = [
      { key: "logo_url", value: body.logoUrl, category: "general" },
      { key: "favicon_url", value: body.faviconUrl, category: "general" },
      { key: "primary_color", value: body.primaryColor, category: "general" },
      { key: "secondary_color", value: body.secondaryColor, category: "general" },
      { key: "custom_css", value: body.customCSS, category: "general" },
    ]

    const userId = getUserObjectId(session.user.id)

    for (const setting of settingsToUpdate) {
      await SystemSettings.findOneAndUpdate(
        { key: setting.key },
        {
          ...setting,
          updatedBy: userId,
          isEncrypted: false,
          isPublic: true,
        },
        { upsert: true, new: true },
      )
    }

    return NextResponse.json({ message: "Branding settings saved successfully" })
  } catch (error) {
    console.error("Branding settings update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
