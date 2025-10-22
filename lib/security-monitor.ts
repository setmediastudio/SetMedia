import dbConnect from "./mongodb"
import SecurityLog from "@/models/SecurityLog"
import ActivityLog from "@/models/ActivityLog"
import type { NextRequest } from "next/server"
import { Types } from "mongoose"

export interface SecurityEvent {
  userId?: string
  sessionId?: string
  event:
    | "login_attempt"
    | "login_success"
    | "login_failure"
    | "logout"
    | "session_expired"
    | "role_escalation_attempt"
    | "suspicious_activity"
    | "rate_limit_exceeded"
    | "csrf_violation"
    | "turnstile_failure"
  severity: "low" | "medium" | "high" | "critical"
  ipAddress: string
  userAgent?: string
  details: any
}

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    await dbConnect()

    let userObjectId: Types.ObjectId | undefined
    if (event.userId) {
      // Check if it's already a valid MongoDB ObjectId
      if (Types.ObjectId.isValid(event.userId) && /^[0-9a-fA-F]{24}$/.test(event.userId)) {
        userObjectId = new Types.ObjectId(event.userId)
      } else {
        userObjectId = undefined
      }
    }

    await SecurityLog.create({
      userId: userObjectId,
      sessionId: event.sessionId,
      event: event.event,
      severity: event.severity,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details,
      resolved: false,
    })

    if (event.severity === "critical" && userObjectId) {
      await ActivityLog.create({
        userId: userObjectId,
        action: "security_alert",
        resource: "security",
        details: {
          event: event.event,
          severity: event.severity,
          ipAddress: event.ipAddress,
          timestamp: new Date(),
        },
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      })

      // Log to console for immediate visibility
      console.error(`[CRITICAL SECURITY EVENT] ${event.event} - User: ${event.userId} - IP: ${event.ipAddress}`)
    }
  } catch (error) {
    console.error("Failed to log security event:", error)
  }
}

export async function logUserActivity(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  request?: NextRequest,
): Promise<void> {
  try {
    await dbConnect()

    if (!Types.ObjectId.isValid(userId) || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return
    }

    let resourceObjectId: Types.ObjectId | undefined
    if (resourceId) {
      if (Types.ObjectId.isValid(resourceId) && /^[0-9a-fA-F]{24}$/.test(resourceId)) {
        resourceObjectId = new Types.ObjectId(resourceId)
      } else {
        resourceObjectId = undefined
      }
    }

    const ipAddress = request ? getClientIP(request) : undefined
    const userAgent = request?.headers.get("user-agent") || undefined

    await ActivityLog.create({
      userId: new Types.ObjectId(userId),
      action,
      resource,
      resourceId: resourceObjectId,
      details,
      ipAddress,
      userAgent,
    })
  } catch (error) {
    console.error("Failed to log user activity:", error)
  }
}

export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const cfConnectingIp = request.headers.get("cf-connecting-ip")

  return cfConnectingIp || realIp || forwardedFor?.split(",")[0]?.trim() || "unknown"
}

export async function detectSuspiciousActivity(userId: string, ipAddress: string): Promise<boolean> {
  try {
    await dbConnect()

    if (!Types.ObjectId.isValid(userId) || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return false
    }

    const userObjectId = new Types.ObjectId(userId)
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    // Check for multiple failed login attempts
    const failedLogins = await SecurityLog.countDocuments({
      userId: userObjectId,
      event: "login_failure",
      createdAt: { $gte: oneHourAgo },
    })

    if (failedLogins >= 5) {
      await logSecurityEvent({
        userId,
        event: "suspicious_activity",
        severity: "high",
        ipAddress,
        details: {
          reason: "Multiple failed login attempts",
          count: failedLogins,
          timeWindow: "1 hour",
        },
      })
      return true
    }

    // Check for logins from multiple IPs
    const recentLogins = await SecurityLog.find({
      userId: userObjectId,
      event: "login_success",
      createdAt: { $gte: oneHourAgo },
    }).distinct("ipAddress")

    if (recentLogins.length >= 3) {
      await logSecurityEvent({
        userId,
        event: "suspicious_activity",
        severity: "medium",
        ipAddress,
        details: {
          reason: "Multiple IP addresses",
          ips: recentLogins,
          timeWindow: "1 hour",
        },
      })
      return true
    }

    return false
  } catch (error) {
    console.error("Failed to detect suspicious activity:", error)
    return false
  }
}

export async function getSecurityMetrics(timeRange: "hour" | "day" | "week" | "month" = "day") {
  try {
    await dbConnect()

    const now = new Date()
    let startTime: Date

    switch (timeRange) {
      case "hour":
        startTime = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case "day":
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case "week":
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
    }

    const [eventCounts, severityCounts, topIPs, unresolvedAlerts] = await Promise.all([
      SecurityLog.aggregate([
        { $match: { createdAt: { $gte: startTime } } },
        { $group: { _id: "$event", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      SecurityLog.aggregate([
        { $match: { createdAt: { $gte: startTime } } },
        { $group: { _id: "$severity", count: { $sum: 1 } } },
      ]),
      SecurityLog.aggregate([
        { $match: { createdAt: { $gte: startTime } } },
        { $group: { _id: "$ipAddress", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      SecurityLog.countDocuments({
        resolved: false,
        severity: { $in: ["high", "critical"] },
      }),
    ])

    return {
      eventCounts,
      severityCounts,
      topIPs,
      unresolvedAlerts,
      timeRange,
    }
  } catch (error) {
    console.error("Failed to get security metrics:", error)
    return null
  }
}

export async function analyzeSecurityTrends(days = 7) {
  try {
    await dbConnect()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const trends = await SecurityLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            event: "$event",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ])

    return trends
  } catch (error) {
    console.error("Failed to analyze security trends:", error)
    return []
  }
}

export async function getBlockedIPs(): Promise<string[]> {
  try {
    await dbConnect()

    const blockedIPs = await SecurityLog.aggregate([
      {
        $match: {
          event: "rate_limit_exceeded",
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      },
      { $group: { _id: "$ipAddress", count: { $sum: 1 } } },
      { $match: { count: { $gte: 10 } } },
      { $project: { _id: 1 } },
    ])

    return blockedIPs.map((item) => item._id)
  } catch (error) {
    console.error("Failed to get blocked IPs:", error)
    return []
  }
}

export async function checkIPReputation(ipAddress: string): Promise<{ isBlocked: boolean; riskLevel: string }> {
  try {
    await dbConnect()

    const recentEvents = await SecurityLog.countDocuments({
      ipAddress,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      severity: { $in: ["high", "critical"] },
    })

    const failedAttempts = await SecurityLog.countDocuments({
      ipAddress,
      event: "login_failure",
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    })

    const isBlocked = recentEvents >= 5 || failedAttempts >= 10
    let riskLevel = "low"

    if (failedAttempts >= 10) riskLevel = "critical"
    else if (recentEvents >= 5) riskLevel = "high"
    else if (failedAttempts >= 5) riskLevel = "medium"

    return { isBlocked, riskLevel }
  } catch (error) {
    console.error("Failed to check IP reputation:", error)
    return { isBlocked: false, riskLevel: "unknown" }
  }
}
