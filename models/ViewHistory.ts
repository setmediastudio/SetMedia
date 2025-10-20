import mongoose from "mongoose"

export interface IViewHistory extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  uploadId: mongoose.Types.ObjectId
  viewedAt: Date
}

const ViewHistorySchema = new mongoose.Schema<IViewHistory>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

ViewHistorySchema.index({ userId: 1, viewedAt: -1 })
ViewHistorySchema.index({ uploadId: 1 })

export default mongoose.models.ViewHistory || mongoose.model<IViewHistory>("ViewHistory", ViewHistorySchema)
