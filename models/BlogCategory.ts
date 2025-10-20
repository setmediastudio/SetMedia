import mongoose from "mongoose"

export interface IBlogCategory extends mongoose.Document {
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const BlogCategorySchema = new mongoose.Schema<IBlogCategory>(
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
      trim: true,
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

// Auto-generate slug from name if not provided
BlogCategorySchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
  next()
})

export default mongoose.models.BlogCategory || mongoose.model<IBlogCategory>("BlogCategory", BlogCategorySchema)
