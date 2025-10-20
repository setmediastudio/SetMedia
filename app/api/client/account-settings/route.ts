export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const user = await User.findById(session.user.id).select("-password")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        provider: user.provider,
        twoFactorEnabled: user.twoFactorEnabled || false,
        language: user.language || "en",
        timezone: user.timezone || "UTC",
        emailNotifications: user.emailNotifications !== false,
        smsNotifications: user.smsNotifications || false,
      },
    })
  } catch (error) {
    console.error("Account settings fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, currentPassword, newPassword, language, timezone, emailNotifications, smsNotifications } = body

    await connectDB()
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update basic info
    if (name) user.name = name
    if (language) user.language = language
    if (timezone) user.timezone = timezone
    if (typeof emailNotifications === "boolean") user.emailNotifications = emailNotifications
    if (typeof smsNotifications === "boolean") user.smsNotifications = smsNotifications

    // Handle email change
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 })
      }
      user.email = email
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password required" }, { status: 400 })
      }

      if (user.provider === "credentials" && user.password) {
        const isValidPassword = await user.comparePassword(currentPassword)
        if (!isValidPassword) {
          return NextResponse.json({ error: "Invalid current password" }, { status: 400 })
        }
      }

      const salt = await bcrypt.genSalt(12)
      user.password = await bcrypt.hash(newPassword, salt)
    }

    await user.save()

    return NextResponse.json({
      message: "Settings updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        language: user.language,
        timezone: user.timezone,
        emailNotifications: user.emailNotifications,
        smsNotifications: user.smsNotifications,
      },
    })
  } catch (error) {
    console.error("Account settings update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
