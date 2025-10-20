import mongoose from "mongoose"

export interface IPortfolioCategory extends mongoose.Document {
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const PortfolioCategorySchema = new mongoose.Schema<IPortfolioCategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.PortfolioCategory ||
  mongoose.model<IPortfolioCategory>("PortfolioCategory", PortfolioCategorySchema)
