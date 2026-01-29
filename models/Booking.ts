import mongoose from "mongoose"

export interface IBooking extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  service: string
  serviceType: "portrait" | "wedding" | "event" | "family" | "corporate" | "product" | "other"
  selectedPackage?: string
  selectedAddOns?: string[]
  totalPrice?: number
  currency?: string
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paystackReference?: string
  preferredDate: Date
  preferredTime: string
  location?: string
  contactPhone?: string
  notes?: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}

const BookingSchema = new mongoose.Schema<IBooking>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    serviceType: {
      type: String,
      enum: ["portrait", "wedding", "event", "family", "corporate", "product", "other"],
      required: true,
    },
    selectedPackage: {
      type: String,
    },
    selectedAddOns: [
      {
        type: String,
      },
    ],
    totalPrice: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: "NGN",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paystackReference: {
      type: String,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    preferredTime: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    contactPhone: {
      type: String,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

BookingSchema.index({ userId: 1, paymentStatus: 1 })
BookingSchema.index({ paystackReference: 1 })

export default mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema)
