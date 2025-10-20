import mongoose from "mongoose"

export interface IPayment extends mongoose.Document {
  userId?: mongoose.Types.ObjectId
  orderId?: mongoose.Types.ObjectId
  productId?: mongoose.Types.ObjectId
  paystackReference: string
  amount: number
  currency: string
  status: "pending" | "success" | "failed" | "abandoned"
  paymentMethod: string
  customerEmail: string
  customerName?: string
  metadata: Record<string, any>
  webhookData: Record<string, any>
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new mongoose.Schema<IPayment>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    paystackReference: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "NGN",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "abandoned"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    webhookData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema)
