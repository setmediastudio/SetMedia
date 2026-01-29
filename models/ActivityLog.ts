import mongoose, { type Document, Schema } from "mongoose"

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId
  action: string
  resource: string
  resourceId?: mongoose.Types.ObjectId
  details?: any
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resource: {
      type: String,
      required: true,
      index: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
)

// Indexes for performance
ActivityLogSchema.index({ userId: 1, createdAt: -1 })
ActivityLogSchema.index({ action: 1, resource: 1 })
ActivityLogSchema.index({ createdAt: -1 })

// TTL index to automatically delete logs after 90 days
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema)
