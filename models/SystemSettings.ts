import mongoose, { type Document, Schema } from "mongoose"

export interface ISystemSettings extends Document {
  key: string
  value: string
  category: "api" | "email" | "sms" | "storage" | "security" | "gdpr" | "general"
  description?: string
  isEncrypted: boolean
  isPublic: boolean
  updatedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const SystemSettingsSchema = new Schema<ISystemSettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["api", "email", "sms", "storage", "security", "gdpr", "general"],
      required: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    isEncrypted: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
SystemSettingsSchema.index({ category: 1, key: 1 })
SystemSettingsSchema.index({ isPublic: 1 })

export default mongoose.models.SystemSettings || mongoose.model<ISystemSettings>("SystemSettings", SystemSettingsSchema)
