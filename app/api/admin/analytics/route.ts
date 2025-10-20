export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Upload from "@/models/Upload"
import Booking from "@/models/Booking"
import Payment from "@/models/Payment"
import Gallery from "@/models/Gallery"
import User from "@/models/User"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30d" // 7d, 30d, 90d, 1y
    const type = searchParams.get("type") || "overview" // overview, revenue, activity, users

    await connectDB()

    const now = new Date()
    let startDate: Date

    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    if (type === "overview") {
      const [
        totalRevenue,
        totalUploads,
        totalBookings,
        totalGalleries,
        totalUsers,
        recentRevenue,
        recentUploads,
        recentBookings,
        recentUsers,
      ] = await Promise.all([
        Payment.aggregate([{ $match: { status: "success" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
        Upload.countDocuments(),
        Booking.countDocuments(),
        Gallery.countDocuments(),
        User.countDocuments(),
        Payment.aggregate([
          { $match: { status: "success", createdAt: { $gte: startDate } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Upload.countDocuments({ createdAt: { $gte: startDate } }),
        Booking.countDocuments({ createdAt: { $gte: startDate } }),
        User.countDocuments({ createdAt: { $gte: startDate } }),
      ])

      return NextResponse.json({
        overview: {
          totalRevenue: totalRevenue[0]?.total || 0,
          totalUploads,
          totalBookings,
          totalGalleries,
          totalUsers,
          recentRevenue: recentRevenue[0]?.total || 0,
          recentUploads,
          recentBookings,
          recentUsers,
        },
      })
    }

    if (type === "revenue") {
      const revenueData = await Payment.aggregate([
        { $match: { status: "success", createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: period === "7d" ? "%Y-%m-%d" : "%Y-%m",
                date: "$createdAt",
              },
            },
            revenue: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])

      const paymentMethods = await Payment.aggregate([
        { $match: { status: "success", createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: "$channel",
            revenue: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ])

      return NextResponse.json({
        revenue: {
          chartData: revenueData,
          paymentMethods,
        },
      })
    }

    if (type === "activity") {
      const uploadActivity = await Upload.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: period === "7d" ? "%Y-%m-%d" : "%Y-%m",
                date: "$createdAt",
              },
            },
            uploads: { $sum: 1 },
            totalSize: { $sum: "$fileSize" },
          },
        },
        { $sort: { _id: 1 } },
      ])

      const galleryViews = await Gallery.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: period === "7d" ? "%Y-%m-%d" : "%Y-%m",
                date: "$createdAt",
              },
            },
            views: { $sum: "$views" },
            galleries: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])

      const bookingStatus = await Booking.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])

      return NextResponse.json({
        activity: {
          uploads: uploadActivity,
          galleryViews,
          bookingStatus,
        },
      })
    }

    if (type === "users") {
      const userGrowth = await User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: period === "7d" ? "%Y-%m-%d" : "%Y-%m",
                date: "$createdAt",
              },
            },
            newUsers: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])

      const usersByRole = await User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ])

      const usersByProvider = await User.aggregate([
        {
          $group: {
            _id: "$provider",
            count: { $sum: 1 },
          },
        },
      ])

      return NextResponse.json({
        users: {
          growth: userGrowth,
          byRole: usersByRole,
          byProvider: usersByProvider,
        },
      })
    }

    return NextResponse.json({ error: "Invalid analytics type" }, { status: 400 })
  } catch (error) {
    console.error("Analytics fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
