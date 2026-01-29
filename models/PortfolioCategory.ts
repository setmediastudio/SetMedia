import mongoose from "mongoose"

export interface IPortfolioCategory extends mongoose.Document {
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
  parentCategoryId?: mongoose.Types.ObjectId
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
    parentCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PortfolioCategory",
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.PortfolioCategory ||
  mongoose.model<IPortfolioCategory>("PortfolioCategory", PortfolioCategorySchema)
