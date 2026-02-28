export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { firebaseAdmin } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  try {
    const { token, companyId } = await req.json()

    if (!token || !companyId) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    // Save token (upsert)
    await supabase
      .from('fcm_subscriptions')
      .upsert(
        {
          token,
          company_id: companyId,
          is_active: true,
        },
        { onConflict: 'token' }
      )

    // Subscribe token to vendor topic
    await firebaseAdmin.messaging().subscribeToTopic(
      token,
      `vendor_${companyId}`
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push register error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}