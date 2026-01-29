import mongoose from "mongoose"

export interface IOrder extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  bookingId?: mongoose.Types.ObjectId
  orderNumber: string
  service: string
  packageType: "digital" | "print" | "both"
  items: {
    name: string
    quantity: number
    price: number
  }[]
  totalAmount: number
  status: "pending" | "processing" | "completed" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  shippingAddress?: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  trackingNumber?: string
  downloadLinks?: string[]
  downloadExpiry?: Date
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new mongoose.Schema<IOrder>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    service: {
      type: String,
      required: true,
    },
    packageType: {
      type: String,
      enum: ["digital", "print", "both"],
      required: true,
    },
    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    shippingAddress: {
      name: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    trackingNumber: String,
    downloadLinks: [String],
    downloadExpiry: Date,
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)
