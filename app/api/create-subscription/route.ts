import Razorpay from "razorpay"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { planType } = await req.json()

    if (!planType) {
      return NextResponse.json(
        { error: "Plan type missing" },
        { status: 400 }
      )
    }

    // 🔥 HARD CHECK ENV
    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return NextResponse.json(
        { error: "Razorpay keys missing in env" },
        { status: 500 }
      )
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID.trim(),
      key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
    })

    const planMap: Record<string, string | undefined> = {
      monthly: process.env.RAZORPAY_PLAN_MONTHLY,
      quarterly: process.env.RAZORPAY_PLAN_QUARTERLY,
      yearly: process.env.RAZORPAY_PLAN_YEARLY,
    }

    const plan_id = planMap[planType]

    if (!plan_id) {
      return NextResponse.json(
        { error: "Invalid plan type or missing plan env" },
        { status: 400 }
      )
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: plan_id.trim(),
      customer_notify: 1,
      total_count: 12,
    })

    return NextResponse.json({
      subscriptionId: subscription.id,
      key: process.env.RAZORPAY_KEY_ID,
    })

  } catch (error: any) {
    console.error("RAZORPAY ERROR:", error)

    return NextResponse.json(
      {
        error: "Failed",
        details: error?.error?.description || error?.message,
      },
      { status: 500 }
    )
  }
}