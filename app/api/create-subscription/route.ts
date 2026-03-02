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

    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 7)

    console.log("Upserting subscription row...")

    const { data, error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          company_id: companyId,
          razorpay_subscription_id: subscription.id,
          razorpay_plan_id: plan_id,
          plan_type: planType,
          status: "trialing",
          trial_ends_at: trialEnd,
          current_period_start: null,
          current_period_end: null,
          cancelled_at: null,
          updated_at: new Date(),
        },
        {
          onConflict: "company_id",
        }
      )
      .select()

    if (error) {
      console.error("SUPABASE UPSERT ERROR:", error)
      return NextResponse.json(
        { error: "Database upsert failed" },
        { status: 500 }
      )
    }

    console.log("Upsert successful:", data)
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