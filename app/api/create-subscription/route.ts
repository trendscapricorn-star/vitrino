import Razorpay from "razorpay"
import { NextResponse } from "next/server"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { planType } = body

    if (!planType) {
      return NextResponse.json(
        { error: "Plan type required" },
        { status: 400 }
      )
    }

    const planMap: Record<string, string> = {
      monthly: process.env.RAZORPAY_PLAN_MONTHLY!,
      quarterly: process.env.RAZORPAY_PLAN_QUARTERLY!,
      yearly: process.env.RAZORPAY_PLAN_YEARLY!,
    }

    const plan_id = planMap[planType]

    if (!plan_id) {
      return NextResponse.json(
        { error: "Invalid plan type" },
        { status: 400 }
      )
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id,
      customer_notify: 1,
      total_count: 12,
    })

    return NextResponse.json({
      subscriptionId: subscription.id,
      key: process.env.RAZORPAY_KEY_ID,
    })

  } catch (error) {
    console.error("Subscription Error:", error)
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    )
  }
}