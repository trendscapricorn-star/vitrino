import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {

  try {

    const { companyId, productId, eventType, visitorId } = await req.json()

    if (!companyId || !eventType) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabase
      .from("catalog_events")
      .insert({
        company_id: companyId,
        product_id: productId || null,
        event_type: eventType,
        visitor_id: visitorId || null
      })

    return NextResponse.json({ success: true })

  } catch (err) {

    console.error("Catalog event error:", err)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )

  }
}