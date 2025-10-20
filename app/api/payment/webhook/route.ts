import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import dbConnect from "@/lib/mongodb"
import Payment from "@/models/Payment"
import Gallery from "@/models/Gallery"
import Upload from "@/models/Upload"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
      .update(body)
      .digest("hex")

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    await dbConnect()

    // Handle different webhook events
    if (event.event === "charge.success") {
      const { reference, status, amount, customer, metadata } = event.data

      const payment = await Payment.findOne({ paystackReference: reference })

      if (!payment) {
        console.error("Payment not found for reference:", reference)
        return NextResponse.json({ error: "Payment not found" }, { status: 404 })
      }

      if (status === "success") {
        payment.status = "success"
        payment.paidAt = new Date()
        payment.webhookData = event.data
        await payment.save()

        // Grant access to purchased content
        const { itemType, itemId } = payment.metadata

        if (itemType === "gallery") {
          await Gallery.findByIdAndUpdate(itemId, {
            $addToSet: { allowedClients: payment.userId },
          })
        } else if (itemType === "upload") {
          await Upload.findByIdAndUpdate(itemId, {
            $addToSet: { paidUsers: payment.userId },
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
