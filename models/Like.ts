import mongoose, { Schema, type Document } from "mongoose"

export interface ILike extends Document {
  user: mongoose.Types.ObjectId
  upload: mongoose.Types.ObjectId
  createdAt: Date
}

const LikeSchema = new Schema<ILike>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    upload: {
      type: Schema.Types.ObjectId,
      ref: "Upload",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to ensure a user can only like an upload once
LikeSchema.index({ user: 1, upload: 1 }, { unique: true })

export default mongoose.models.Like || mongoose.model<ILike>("Like", LikeSchema)
