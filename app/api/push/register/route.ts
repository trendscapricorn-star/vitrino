export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { firebaseAdmin } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  try {
    const { token, companyId, platform, userAgent } = await req.json()

    if (!token || !companyId) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    await supabase
      .from('fcm_subscriptions')
      .upsert(
        {
          token,
          company_id: companyId,
          platform,
          user_agent: userAgent,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'token' }
      )

    try {
      await firebaseAdmin.messaging().subscribeToTopic(
        token,
        `vendor_${companyId}`
      )
    } catch (err) {
      console.error("Topic subscribe failed", err)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Push register error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}