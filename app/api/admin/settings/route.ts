export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import SystemSettings from "@/models/SystemSettings"
import crypto from "crypto"

const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || "default-key-change-in-production"

function encrypt(text: string): string {
  const cipher = crypto.createCipher("aes-256-cbc", ENCRYPTION_KEY)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return encrypted
}

function decrypt(encryptedText: string): string {
  const decipher = crypto.createDecipher("aes-256-cbc", ENCRYPTION_KEY)
  let decrypted = decipher.update(encryptedText, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    await connectDB()

    const filter = category ? { category } : {}
    const settings = await SystemSettings.find(filter)
      .populate("updatedBy", "name email")
      .sort({ category: 1, key: 1 })
      .lean()

    // Decrypt encrypted values for display (mask sensitive data)
    const processedSettings = settings.map((setting) => ({
      ...setting,
      value: setting.isEncrypted
        ? setting.key.includes("password") || setting.key.includes("secret") || setting.key.includes("key")
          ? "••••••••"
          : decrypt(setting.value)
        : setting.value,
    }))

    return NextResponse.json({ settings: processedSettings })
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { settings } = body

    await connectDB()

    const updatePromises = settings.map(async (setting: any) => {
      const { key, value, category, description, isEncrypted } = setting

      const processedValue = isEncrypted ? encrypt(String(value)) : value

      return SystemSettings.findOneAndUpdate(
        { key },
        {
          key,
          value: processedValue,
          category,
          description,
          isEncrypted,
          updatedBy: session.user.id,
        },
        { upsert: true, new: true },
      )
    })

    await Promise.all(updatePromises)

    return NextResponse.json({ message: "Settings updated successfully" })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
