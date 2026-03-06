export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {

  try {

    const { token, companyId } = await req.json()

    if (!token || !companyId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase
      .from("fcm_subscriptions")
      .upsert(
        {
          token,
          company_id: companyId,
          platform: "desktop",
          is_active: true
        },
        { onConflict: "token" }
      )

    if (error) {
      console.error(error)
    }

    return NextResponse.json({ success: true })

  } catch (err) {

    console.error(err)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )

  }

}