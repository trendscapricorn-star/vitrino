import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { companyId } = await req.json()

    if (!companyId) {
      return NextResponse.json(
        { error: "Missing companyId" },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 7)

    const { error } = await supabase
      .from("subscriptions")
      .insert({
        company_id: companyId,
        plan_type: "trial",
        status: "trialing",
        trial_ends_at: trialEnd,
      })

    if (error) {
      console.error("Trial insert error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}