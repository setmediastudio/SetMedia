import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import dbConnect from "@/lib/mongodb"
import Payment from "@/models/Payment"
import Order from "@/models/Order"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    // Verify webhook signature
    const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!).update(body).digest("hex")

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    await dbConnect()

    if (event.event === "charge.success") {
      const { reference, amount, customer, paid_at, channel } = event.data

      // Update payment record
      const payment = await Payment.findOneAndUpdate(
        { paystackReference: reference },
        {
          status: "success",
          amount: amount / 100, // Convert from kobo to naira
          customerEmail: customer.email,
          customerName: customer.first_name + " " + customer.last_name,
          paymentMethod: channel,
          paidAt: new Date(paid_at),
          webhookData: event.data,
        },
        { new: true, upsert: true },
      )

      // Update related order if exists
      if (payment.orderId) {
        await Order.findByIdAndUpdate(payment.orderId, {
          status: "paid",
          paidAt: new Date(paid_at),
        })
      }
    } else if (event.event === "charge.failed") {
      const { reference } = event.data

      await Payment.findOneAndUpdate(
        { paystackReference: reference },
        {
          status: "failed",
          webhookData: event.data,
        },
      )
    }

    return NextResponse.json({ message: "Webhook processed successfully" })
  } catch (error) {
    console.error("Paystack webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
