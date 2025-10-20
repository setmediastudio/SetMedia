export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import SystemSettings from "@/models/SystemSettings"
import crypto from "crypto"
import { getUserObjectId } from "@/lib/admin-helper"

const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || "default-key-change-in-production"

function encrypt(text: string): string {
  const cipher = crypto.createCipher("aes-256-cbc", ENCRYPTION_KEY)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return encrypted
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    await connectDB()

    const settingsToUpdate = [
      { key: "two_factor_auth", value: String(body.twoFactorAuth), category: "security", isEncrypted: false },
      { key: "session_timeout", value: String(body.sessionTimeout), category: "security", isEncrypted: false },
      { key: "password_policy", value: body.passwordPolicy, category: "security", isEncrypted: false },
      { key: "ip_whitelist", value: body.ipWhitelist, category: "security", isEncrypted: true },
      { key: "max_login_attempts", value: String(body.maxLoginAttempts), category: "security", isEncrypted: false },
    ]

    const userId = getUserObjectId(session.user.id)

    for (const setting of settingsToUpdate) {
      await SystemSettings.findOneAndUpdate(
        { key: setting.key },
        {
          key: setting.key,
          value: setting.isEncrypted ? encrypt(setting.value) : setting.value,
          category: setting.category,
          isEncrypted: setting.isEncrypted,
          updatedBy: userId,
          isPublic: false,
        },
        { upsert: true, new: true },
      )
    }

    return NextResponse.json({ message: "Security settings saved successfully" })
  } catch (error) {
    console.error("Security settings update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
