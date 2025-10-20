import mongoose from "mongoose"

export interface IServicePricing extends mongoose.Document {
  serviceName: string
  serviceType: "portrait" | "wedding" | "event" | "family" | "corporate" | "product" | "other"
  description: string
  basePrice: number
  currency: string
  packages: {
    name: string
    description: string
    price: number
    features: string[]
    isPopular?: boolean
  }[]
  addOns: {
    name: string
    description: string
    price: number
  }[]
  isActive: boolean
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

const ServicePricingSchema = new mongoose.Schema<IServicePricing>(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    serviceType: {
      type: String,
      enum: ["portrait", "wedding", "event", "family", "corporate", "product", "other"],
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "NGN",
    },
    packages: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        features: [
          {
            type: String,
          },
        ],
        isPopular: {
          type: Boolean,
          default: false,
        },
      },
    ],
    addOns: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Index for faster queries
ServicePricingSchema.index({ serviceType: 1, isActive: 1 })
ServicePricingSchema.index({ displayOrder: 1 })

export default mongoose.models.ServicePricing || mongoose.model<IServicePricing>("ServicePricing", ServicePricingSchema)
