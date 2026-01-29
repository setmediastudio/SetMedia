import mongoose from "mongoose"

export interface IUpload extends mongoose.Document {
  uploadedBy: mongoose.Types.ObjectId
  fileName: string
  originalName: string
  fileSize: number
  fileType: string
  storageKey: string
  publicUrl: string
  bucket: string
  sdStorageKey?: string
  sdPublicUrl?: string
  sdFileSize?: number
  title?: string
  description?: string
  tags: string[]
  portfolioCategory?: mongoose.Types.ObjectId
  isGalleryItem: boolean
  isPaid: boolean
  price?: number
  hdPrice?: number
  paidUsers: mongoose.Types.ObjectId[]
  assignedUsers: mongoose.Types.ObjectId[]
  status: "uploading" | "processing" | "processed" | "failed"
  metadata: {
    width?: number
    height?: number
    duration?: number
  }
  createdAt: Date
  updatedAt: Date
}

const UploadSchema = new mongoose.Schema<IUpload>(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
    },
    publicUrl: {
      type: String,
      required: true,
    },
    bucket: {
      type: String,
      required: true,
    },
    sdStorageKey: {
      type: String,
    },
    sdPublicUrl: {
      type: String,
    },
    sdFileSize: {
      type: Number,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
    portfolioCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PortfolioCategory",
    },
    isGalleryItem: {
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
    hdPrice: {
      type: Number,
      default: 0,
    },
    paidUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    assignedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["uploading", "processing", "processed", "failed"],
      default: "uploading",
    },
    metadata: {
      width: Number,
      height: Number,
      duration: Number,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Upload || mongoose.model<IUpload>("Upload", UploadSchema)
