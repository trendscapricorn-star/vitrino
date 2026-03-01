import crypto from "crypto"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("x-razorpay-signature")

  if (!signature) {
    return new Response("No signature", { status: 400 })
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex")

  if (expectedSignature !== signature) {
    return new Response("Invalid signature", { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.event === "subscription.activated") {
    const subscriptionId = event.payload.subscription.entity.id
    const currentPeriodEnd =
      event.payload.subscription.entity.current_end * 1000

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabase
      .from("subscriptions")
      .update({
        status: "active",
        current_period_end: new Date(currentPeriodEnd),
      })
      .eq("razorpay_subscription_id", subscriptionId)

    await supabase
      .from("companies")
      .update({
        subscription_status: "active",
      })
      .eq("id", event.payload.subscription.entity.notes?.company_id)
  }

  return NextResponse.json({ received: true })
}