import mongoose from "mongoose"

export interface IGallery extends mongoose.Document {
  createdBy: mongoose.Types.ObjectId
  allowedClients: mongoose.Types.ObjectId[]
  title: string
  description?: string
  password?: string
  isPublic: boolean
  uploads: mongoose.Types.ObjectId[]
  coverImage?: string
  watermarkEnabled: boolean
  watermarkText?: string
  watermarkOpacity: number
  downloadEnabled: boolean
  isPaid: boolean
  price?: number
  paidUsers: mongoose.Types.ObjectId[]
  viewCount: number
  tags: string[]
  expiresAt?: Date
  status: "active" | "archived" | "private"
  createdAt: Date
  updatedAt: Date
}

const GallerySchema = new mongoose.Schema<IGallery>(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    allowedClients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    uploads: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Upload",
      },
    ],
    coverImage: {
      type: String,
    },
    watermarkEnabled: {
      type: Boolean,
      default: true,
    },
    watermarkText: {
      type: String,
      default: "© SetMedia",
    },
    watermarkOpacity: {
      type: Number,
      default: 0.5,
      min: 0.1,
      max: 1,
    },
    downloadEnabled: {
      type: Boolean,
      default: false,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    paidUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    viewCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    expiresAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "archived", "private"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Gallery || mongoose.model<IGallery>("Gallery", GallerySchema)
