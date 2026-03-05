import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {

  try {

    const { companyId, name, mobile } = await req.json()

    if (!companyId || !mobile) {
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
      .from("catalog_visitors")   // ✅ corrected
      .insert({
        company_id: companyId,
        name: name ?? null,
        mobile
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      visitor: data
    })

  } catch (err) {

    console.error("Visitor API error:", err)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )

  }

}