import mongoose from "mongoose"

export interface IUserActivity extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  activityType: "upload_view" | "download" | "like" | "save" | "booking" | "order" | "gallery_view"
  relatedId?: mongoose.Types.ObjectId
  metadata?: Record<string, any>
  createdAt: Date
}

const UserActivitySchema = new mongoose.Schema<IUserActivity>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityType: {
      type: String,
      enum: ["upload_view", "download", "like", "save", "booking", "order", "gallery_view"],
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
)

UserActivitySchema.index({ userId: 1, createdAt: -1 })
UserActivitySchema.index({ activityType: 1 })

export default mongoose.models.UserActivity || mongoose.model<IUserActivity>("UserActivity", UserActivitySchema)
