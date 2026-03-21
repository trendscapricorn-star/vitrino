import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {

    const { companyId, planType } = await req.json()

    if (!companyId || !planType) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const now = new Date()

    // 🧠 Plan duration logic
    let days = 30

    if (planType === "quarterly") days = 90
    if (planType === "yearly") days = 365

    const end = new Date(now)
    end.setDate(end.getDate() + days)

    // ✅ UPSERT (safe for both insert/update)
    const { error } = await supabase
      .from("subscriptions")
      .upsert({
        company_id: companyId,
        plan_type: planType,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: end.toISOString(),
        razorpay_subscription_id: null,
        updated_at: now.toISOString()
      })

    if (error) {
      console.error("DB ERROR:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("CONFIRM PAYMENT ERROR:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to confirm payment" },
      { status: 500 }
    )
  }
}