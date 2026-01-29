import mongoose from "mongoose"

export interface IBlogPost extends mongoose.Document {
  title: string
  slug: string
  excerpt: string
  content: string
  author: {
    name: string
    email?: string
  }
  category: mongoose.Types.ObjectId
  featuredImage?: string
  images?: string[]
  videos?: string[]
  tags: string[]
  readTime?: string
  isPublished: boolean
  publishedAt?: Date
  viewCount: number
  createdBy: mongoose.Types.ObjectId
  seoTitle?: string
  seoDescription?: string
  createdAt: Date
  updatedAt: Date
}

const BlogPostSchema = new mongoose.Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCategory",
      required: true,
    },
    featuredImage: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    videos: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    readTime: {
      type: String,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seoTitle: {
      type: String,
    },
    seoDescription: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Auto-generate slug from title if not provided
BlogPostSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  // Set publishedAt when first published
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date()
  }

  next()
})

export default mongoose.models.BlogPost || mongoose.model<IBlogPost>("BlogPost", BlogPostSchema)
