import mongoose, { type Document, Schema } from "mongoose"

export interface ISecurityLog extends Document {
  userId?: mongoose.Types.ObjectId
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
  resolved: boolean
  createdAt: Date
}

const SecurityLogSchema = new Schema<ISecurityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    event: {
      type: String,
      required: true,
      enum: [
        "login_attempt",
        "login_success",
        "login_failure",
        "logout",
        "session_expired",
        "role_escalation_attempt",
        "suspicious_activity",
        "rate_limit_exceeded",
        "csrf_violation",
        "turnstile_failure",
      ],
      index: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "critical"],
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
    },
    details: {
      type: Schema.Types.Mixed,
      required: true,
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
)

// Indexes for performance and security monitoring
SecurityLogSchema.index({ event: 1, severity: 1, createdAt: -1 })
SecurityLogSchema.index({ ipAddress: 1, createdAt: -1 })
SecurityLogSchema.index({ userId: 1, event: 1, createdAt: -1 })
SecurityLogSchema.index({ resolved: 1, severity: 1 })

// TTL index to automatically delete logs after 1 year
SecurityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 })

export default mongoose.models.SecurityLog || mongoose.model<ISecurityLog>("SecurityLog", SecurityLogSchema)
