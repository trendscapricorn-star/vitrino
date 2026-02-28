import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { firebaseAdmin } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { companyId, title, body: messageBody, url } = body

    if (!companyId || !title || !messageBody) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: tokens } = await supabase
      .from('fcm_tokens') // ⚠️ make sure this table name is correct
      .select('token')
      .eq('company_id', companyId)

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ success: true, sent: 0 })
    }

    // ✅ Correct way to get messaging
    const messaging = firebaseAdmin.messaging()

    const response = await messaging.sendEachForMulticast({
      tokens: tokens.map((t: any) => t.token),
      notification: {
        title,
        body: messageBody,
      },
      data: {
        url: url || '/',
      },
    })

    return NextResponse.json({
      success: true,
      sent: response.successCount,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}