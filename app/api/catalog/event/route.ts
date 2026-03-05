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

   const { data, error } = await supabase
  .from("catalog_events")
  .insert({
    company_id: companyId,
    product_id: productId || null,
    event_type: eventType,
    visitor_id: visitorId || null
  })
  .select()

if (error) {
  console.error("Supabase insert error:", error)
  return NextResponse.json({ error }, { status: 500 })
}

console.log("Inserted row:", data)

    return NextResponse.json({ success: true })

  } catch (err) {

    console.error("Catalog event error:", err)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )

  }
}