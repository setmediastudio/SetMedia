import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { logSecurityEvent, detectSuspiciousActivity, getClientIP } from "./security-monitor"
import type { NextRequest } from "next/server"

export interface SessionValidationResult {
  valid: boolean
  session?: any
  reason?: string
}

export async function validateSessionSecurity(request: NextRequest): Promise<SessionValidationResult> {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return { valid: false, reason: "No session found" }
    }

    const clientIP = getClientIP(request)
    const userAgent = request.headers.get("user-agent") || ""

    // Check for session hijacking indicators
    if (await isSessionHijacked(session, clientIP, userAgent)) {
      await logSecurityEvent({
        userId: session.user?.id,
        sessionId: session.sessionType,
        event: "suspicious_activity",
        severity: "critical",
        ipAddress: clientIP,
        userAgent,
        details: {
          reason: "Potential session hijacking detected",
          sessionType: session.sessionType,
          userRole: session.user?.role,
        },
      })

      return { valid: false, reason: "Session security violation detected" }
    }

    // Check for role escalation attempts
    if (await isRoleEscalationAttempt(session)) {
      await logSecurityEvent({
        userId: session.user?.id,
        sessionId: session.sessionType,
        event: "role_escalation_attempt",
        severity: "critical",
        ipAddress: clientIP,
        userAgent,
        details: {
          currentRole: session.user?.role,
          sessionType: session.sessionType,
          provider: session.provider,
        },
      })

      return { valid: false, reason: "Role escalation attempt detected" }
    }

    // Check for suspicious activity patterns
    if (session.user?.id && (await detectSuspiciousActivity(session.user.id, clientIP))) {
      return { valid: false, reason: "Suspicious activity detected" }
    }

    return { valid: true, session }
  } catch (error) {
    console.error("Session validation error:", error)
    return { valid: false, reason: "Session validation failed" }
  }
}

async function isSessionHijacked(session: any, clientIP: string, userAgent: string): Promise<boolean> {
  // Check for rapid IP changes (basic heuristic)
  const sessionAge = Date.now() - new Date(session.iat * 1000).getTime()
  const maxSessionAge = 24 * 60 * 60 * 1000 // 24 hours

  if (sessionAge > maxSessionAge) {
    return true
  }

  // Additional checks could include:
  // - Geolocation changes
  // - User agent changes
  // - Unusual access patterns

  return false
}

async function isRoleEscalationAttempt(session: any): Promise<boolean> {
  // Check for inconsistent role/session type combinations
  if (session.user?.role === "admin" && session.sessionType !== "admin") {
    return true
  }

  if (session.user?.role !== "admin" && session.sessionType === "admin") {
    return true
  }

  // Check for provider mismatches
  if (session.sessionType === "admin" && session.provider !== "admin-credentials") {
    return true
  }

  return false
}

export async function logAuthEvent(
  event: "login_attempt" | "login_success" | "login_failure" | "logout",
  request: NextRequest,
  userId?: string,
  details?: any,
): Promise<void> {
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get("user-agent") || ""

  let severity: "low" | "medium" | "high" | "critical" = "low"

  switch (event) {
    case "login_failure":
      severity = "medium"
      break
    case "login_success":
      severity = "low"
      break
    case "logout":
      severity = "low"
      break
    default:
      severity = "low"
  }

  await logSecurityEvent({
    userId,
    event,
    severity,
    ipAddress: clientIP,
    userAgent,
    details: details || {},
  })
}
