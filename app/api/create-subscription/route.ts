import Razorpay from "razorpay"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    console.log("---- CREATE SUBSCRIPTION START ----")

    const { planType, companyId } = await req.json()

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

    /* 🔍 Get existing subscription (trial row) */
    const { data: existingSub, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("company_id", companyId)
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json(
        { error: "Failed to fetch subscription" },
        { status: 500 }
      )
    }

    if (!existingSub) {
      return NextResponse.json(
        { error: "No subscription found" },
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
      total_count: 12,
      notes: {
        company_id: companyId,
      },
    })

    console.log("Razorpay subscription created:", subscription.id)

    /* 🔥 UPDATE existing subscription row */
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        razorpay_subscription_id: subscription.id,
        razorpay_plan_id: plan_id,
        plan_type: planType,
        status: "created",
        trial_ends_at: null,
        updated_at: new Date(),
      })
      .eq("company_id", companyId)

    if (updateError) {
      console.error("SUPABASE UPDATE ERROR:", updateError)
      return NextResponse.json(
        { error: "Database update failed" },
        { status: 500 }
      )
    }

    console.log("Subscription updated successfully")
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