import mongoose, { type Document, Schema } from "mongoose"

export interface IRecycleBin extends Document {
  resourceType: "upload" | "user" | "booking" | "gallery" | "product" | "order"
  resourceId: mongoose.Types.ObjectId
  originalData: any
  deletedBy: mongoose.Types.ObjectId
  deletedAt: Date
  reason?: string
  expiresAt: Date
  createdAt: Date
}

const RecycleBinSchema = new Schema<IRecycleBin>(
  {
    resourceType: {
      type: String,
      enum: ["upload", "user", "booking", "gallery", "product", "order"],
      required: true,
      index: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    originalData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    reason: {
      type: String,
      maxlength: 500,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
)

// Indexes for performance
RecycleBinSchema.index({ resourceType: 1, deletedAt: -1 })
RecycleBinSchema.index({ deletedBy: 1, deletedAt: -1 })

// TTL index to automatically delete expired items
RecycleBinSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.RecycleBin || mongoose.model<IRecycleBin>("RecycleBin", RecycleBinSchema)
