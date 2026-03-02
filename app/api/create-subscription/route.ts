import Razorpay from "razorpay"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    console.log("---- CREATE SUBSCRIPTION START ----")

    const body = await req.json()
    const { planType, companyId } = body

    if (!planType || !companyId) {
      return NextResponse.json(
        { error: "Missing planType or companyId" },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    /* 🔒 Prevent duplicate subscription creation */
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("company_id", companyId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "Subscription already exists" },
        { status: 400 }
      )
    }

    /* 🔹 Razorpay Init */
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
      total_count: 12, // ✅ REQUIRED by Razorpay types
      notes: {
        company_id: companyId,
      },
    })

    console.log("Razorpay subscription created:", subscription.id)

    /* 🔹 Insert DB row with status = created */
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        company_id: companyId,
        razorpay_subscription_id: subscription.id,
        razorpay_plan_id: plan_id,
        plan_type: planType,
        status: "created", // 🔥 Not trialing
        trial_ends_at: null,
        current_period_start: null,
        current_period_end: null,
        cancelled_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .select()
      .single()

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error)
      return NextResponse.json(
        { error: "Database insert failed" },
        { status: 500 }
      )
    }

    console.log("Subscription row inserted:", data.id)
    console.log("---- CREATE SUBSCRIPTION END ----")

    return NextResponse.json({
      subscriptionId: subscription.id,
      key: process.env.RAZORPAY_KEY_ID,
    })

  } catch (error: any) {
    console.error("🔥 CREATE SUB ERROR:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to create subscription" },
      { status: 500 }
    )
  }
}