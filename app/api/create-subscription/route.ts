import Razorpay from "razorpay"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    console.log("---- CREATE SUBSCRIPTION START ----")

    const body = await req.json()
    console.log("Incoming body:", body)

    const { planType, companyId } = body

    if (!planType || !companyId) {
      console.log("Missing planType or companyId")
      return NextResponse.json(
        { error: "Missing planType or companyId" },
        { status: 400 }
      )
    }

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

    if (!plan_id) {
      return NextResponse.json(
        { error: "Invalid plan type" },
        { status: 400 }
      )
    }

    console.log("Creating Razorpay subscription...")

    const subscription = await razorpay.subscriptions.create({
      plan_id,
      customer_notify: 1,
      total_count: 12,
      notes: {
        company_id: companyId,
      },
    })

    console.log("Razorpay subscription created:", subscription.id)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log("Updating existing subscription row...")

    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        razorpay_subscription_id: subscription.id,
        razorpay_plan_id: plan_id,
        plan_type: planType,
        status: "trialing",
        updated_at: new Date(),
      })
      .eq("company_id", companyId)
      .in("status", ["trialing", "expired"])
      .select()

    if (error) {
      console.error("SUPABASE UPDATE ERROR:", error)
      return NextResponse.json(
        { error: "Database update failed" },
        { status: 500 }
      )
    }

    console.log("Update successful:", data)
    console.log("---- CREATE SUBSCRIPTION END ----")

    return NextResponse.json({
      subscriptionId: subscription.id,
      key: process.env.RAZORPAY_KEY_ID,
    })

  } catch (error: any) {
    console.error("🔥 CREATE SUB ERROR:", error)
    return NextResponse.json(
      { error: error?.message || "Failed" },
      { status: 500 }
    )
  }
}