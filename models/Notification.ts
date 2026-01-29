import mongoose, { type Document, Schema } from "mongoose"

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  type: "email" | "sms" | "system"
  category: "booking" | "payment" | "upload" | "gallery" | "system" | "marketing"
  title: string
  message: string
  status: "pending" | "sent" | "delivered" | "failed" | "read"
  sentAt?: Date
  deliveredAt?: Date
  readAt?: Date
  failureReason?: string
  metadata?: {
    email?: string
    phone?: string
    provider?: string
    messageId?: string
    webhookData?: any
  }
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["email", "sms", "system"],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["booking", "payment", "upload", "gallery", "system", "marketing"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed", "read"],
      default: "pending",
      index: true,
    },
    sentAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    failureReason: {
      type: String,
      maxlength: 500,
    },
    metadata: {
      email: String,
      phone: String,
      provider: String,
      messageId: String,
      webhookData: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
NotificationSchema.index({ userId: 1, createdAt: -1 })
NotificationSchema.index({ status: 1, createdAt: -1 })
NotificationSchema.index({ type: 1, category: 1 })

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema)
