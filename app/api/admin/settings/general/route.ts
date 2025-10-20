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
      { key: "site_name", value: body.siteName, category: "general" },
      { key: "site_description", value: body.siteDescription, category: "general" },
      { key: "site_url", value: body.siteUrl, category: "general" },
      { key: "contact_email", value: body.contactEmail, category: "general" },
      { key: "support_email", value: body.supportEmail, category: "general" },
      { key: "timezone", value: body.timezone, category: "general" },
      { key: "language", value: body.language, category: "general" },
      { key: "currency", value: body.currency, category: "general" },
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

    return NextResponse.json({ message: "General settings saved successfully" })
  } catch (error) {
    console.error("General settings update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
