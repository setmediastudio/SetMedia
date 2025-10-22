export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import UserActivity from "@/models/UserActivity"
import { getUserObjectId } from "@/lib/admin-helper"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userId = getUserObjectId(session.user.id)

    // Get monthly activity for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const activities = await UserActivity.find({
      userId,
      createdAt: { $gte: sixMonthsAgo },
    }).lean()

    // Group by month
    const monthlyData: Record<string, number> = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    activities.forEach((activity: any) => {
      const date = new Date(activity.createdAt)
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1
    })

    // Convert to array format for chart
    const chartData = Object.entries(monthlyData)
      .map(([month, count]) => ({
        month: month.split(" ")[0],
        activities: count,
      }))
      .slice(-6)

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Activity error:", error)
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 })
  }
}
