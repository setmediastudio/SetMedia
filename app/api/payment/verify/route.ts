export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Payment from "@/models/Payment"
import Gallery from "@/models/Gallery"
import Upload from "@/models/Upload"
import { paystackService } from "@/lib/paystack"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json({ error: "Missing payment reference" }, { status: 400 })
    }

    await dbConnect()

    // Verify payment with Paystack
    const verification = await paystackService.verifyPayment(reference)

    if (!verification.status) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // Update payment record
    const payment = await Payment.findOne({ paystackReference: reference })

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }

    if (verification.data.status === "success") {
      payment.status = "success"
      payment.paidAt = new Date(verification.data.paid_at)
      payment.webhookData = verification.data
      await payment.save()

      // Grant access to the purchased item
      const { itemType, itemId } = payment.metadata

      if (itemType === "gallery") {
        // Add user to gallery's allowed clients
        await Gallery.findByIdAndUpdate(itemId, {
          $addToSet: { allowedClients: payment.userId },
        })
      } else if (itemType === "upload") {
        // Mark upload as paid for this user (you might need a separate model for this)
        // For now, we'll add the user to a paid users array if it exists
        await Upload.findByIdAndUpdate(itemId, {
          $addToSet: { paidUsers: payment.userId },
        })
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        payment: {
          id: payment._id,
          status: payment.status,
          amount: payment.amount,
        },
      })
    } else {
      payment.status = "failed"
      payment.webhookData = verification.data
      await payment.save()

      return NextResponse.json({ error: "Payment was not successful" }, { status: 400 })
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
