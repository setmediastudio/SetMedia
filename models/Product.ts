import mongoose from "mongoose"

export interface IProduct extends mongoose.Document {
  title: string
  description: string
  type: "digital" | "physical" | "service"
  category: string
  price: number
  currency: string
  images: string[]
  files?: string[] // For digital products
  features?: string[] // Service features/inclusions
  icon?: string // Icon name for service display
  licenseType: "standard" | "extended" | "commercial" | "exclusive"
  licenseDetails: string
  tags: string[]
  isActive: boolean
  stock?: number // For physical products
  downloadLimit?: number // For digital products
  specifications?: Record<string, any>
  seoTitle?: string
  seoDescription?: string
  salesCount: number
  revenue: number
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["digital", "physical", "service"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "NGN",
    },
    images: [
      {
        type: String,
      },
    ],
    files: [
      {
        type: String,
      },
    ],
    features: [
      {
        type: String,
      },
    ],
    icon: {
      type: String,
    },
    licenseType: {
      type: String,
      enum: ["standard", "extended", "commercial", "exclusive"],
      default: "standard",
    },
    licenseDetails: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      min: 0,
    },
    downloadLimit: {
      type: Number,
      default: 5,
    },
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    seoTitle: {
      type: String,
    },
    seoDescription: {
      type: String,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)
