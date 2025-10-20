import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Payment from "@/models/Payment"
import { paystackService } from "@/lib/paystack"
import { getUserObjectId } from "@/lib/admin-helper"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, itemType, itemId, metadata } = body

    if (!amount || !itemType || !itemId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    const userId = getUserObjectId(session.user.id)
    const reference = paystackService.generateReference("SETMEDIA")

    // Create payment record
    const payment = await Payment.create({
      userId,
      paystackReference: reference,
      amount,
      currency: "NGN",
      status: "pending",
      paymentMethod: "paystack",
      customerEmail: session.user.email,
      customerName: session.user.name,
      metadata: {
        itemType, // 'gallery', 'upload', 'album'
        itemId,
        ...metadata,
      },
    })

    // Initialize Paystack payment
    const paystackResponse = await paystackService.initializePayment({
      email: session.user.email!,
      amount: paystackService.toKobo(amount),
      reference,
      metadata: {
        paymentId: payment._id.toString(),
        userId: userId.toString(),
        itemType,
        itemId,
        ...metadata,
      },
      callback_url: `${process.env.NEXTAUTH_URL}/payment/verify?reference=${reference}`,
    })

    if (!paystackResponse.status) {
      return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment._id,
        reference,
        authorizationUrl: paystackResponse.data?.authorization_url,
      },
    })
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
  }
}
