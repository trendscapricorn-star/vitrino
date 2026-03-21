import Razorpay from "razorpay"
import { NextResponse } from "next/server"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: Request) {
  try {

    const { planType } = await req.json()

    const amountMap: Record<string, number> = {
      monthly: 39900,
      quarterly: 99900,
      yearly: 299900,
    }

    const amount = amountMap[planType]

    if (!amount) {
      return NextResponse.json(
        { error: "Invalid plan type" },
        { status: 400 }
      )
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    })

    return NextResponse.json({
      orderId: order.id,
      amount,
      key: process.env.RAZORPAY_KEY_ID,
    })

  } catch (error: any) {
    console.error("CREATE ORDER ERROR:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to create order" },
      { status: 500 }
    )
  }
}