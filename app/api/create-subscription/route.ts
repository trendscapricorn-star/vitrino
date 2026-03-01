import Razorpay from "razorpay"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    console.log("---- CREATE SUBSCRIPTION CALLED ----")

    const body = await req.json()
    console.log("Request body:", body)

    const { planType } = body

    if (!planType) {
      console.log("Missing planType")
      return NextResponse.json(
        { error: "Plan type required" },
        { status: 400 }
      )
    }

    console.log("PlanType:", planType)

    console.log("ENV CHECK:")
    console.log("KEY_ID:", process.env.RAZORPAY_KEY_ID ? "OK" : "MISSING")
    console.log("KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "OK" : "MISSING")
    console.log("PLAN_MONTHLY:", process.env.RAZORPAY_PLAN_MONTHLY)
    console.log("PLAN_QUARTERLY:", process.env.RAZORPAY_PLAN_QUARTERLY)
    console.log("PLAN_YEARLY:", process.env.RAZORPAY_PLAN_YEARLY)

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const planMap: Record<string, string | undefined> = {
      monthly: process.env.RAZORPAY_PLAN_MONTHLY,
      quarterly: process.env.RAZORPAY_PLAN_QUARTERLY,
      yearly: process.env.RAZORPAY_PLAN_YEARLY,
    }

    const plan_id = planMap[planType]

    console.log("Resolved plan_id:", plan_id)

    if (!plan_id) {
      console.log("Invalid plan type or missing env")
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

    console.log("Subscription created:", subscription.id)

    return NextResponse.json({
      subscriptionId: subscription.id,
      key: process.env.RAZORPAY_KEY_ID,
    })

  } catch (error: any) {
    console.error("🔥 FULL ERROR:", error)
    console.error("🔥 ERROR RESPONSE:", error?.error)

    return NextResponse.json(
      {
        error: "Failed",
        details: error?.error || error?.message || "Unknown error",
      },
      { status: 500 }
    )
  }
}