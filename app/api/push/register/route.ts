export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { firebaseAdmin } from '@/lib/firebase-admin'

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const {
      token,
      companyId,
      platform,
      userAgent
    } = body

    if (!token || !companyId) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    const safePlatform =
      platform === 'android' ||
      platform === 'ios' ||
      platform === 'desktop'
        ? platform
        : 'desktop'

    const { data, error } = await supabase
      .from('fcm_subscriptions')
      .upsert(
        {
          token,
          company_id: companyId,
          platform: safePlatform,
          user_agent: userAgent || null,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'token' }
      )

    if (error) {
      console.error('FCM INSERT ERROR:', error)

      return NextResponse.json(
        { error: 'Insert failed', details: error },
        { status: 500 }
      )
    }

    console.log('FCM INSERT SUCCESS:', data)

    try {

      await firebaseAdmin
        .messaging()
        .subscribeToTopic(
          token,
          `vendor_${companyId}`
        )

    } catch (err) {

      console.error(
        'Topic subscribe failed:',
        err
      )

    }

    return NextResponse.json({
      success: true
    })

  } catch (error) {

    console.error(
      'Push register error:',
      error
    )

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )

  }

}