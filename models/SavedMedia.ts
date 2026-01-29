import mongoose from "mongoose"

export interface ISavedMedia extends mongoose.Document {
  user: mongoose.Types.ObjectId
  upload: mongoose.Types.ObjectId
  savedAt: Date
}

const SavedMediaSchema = new mongoose.Schema<ISavedMedia>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    upload: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
      required: true,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

SavedMediaSchema.index({ user: 1, upload: 1 }, { unique: true })

export default mongoose.models.SavedMedia || mongoose.model<ISavedMedia>("SavedMedia", SavedMediaSchema)
