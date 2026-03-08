export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { firebaseAdmin } from '@/lib/firebase-admin'

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const {
      companyId,
      title,
      body: messageBody,
      url
    } = body

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

    /* Fetch tokens */

    const { data: tokens, error } = await supabase
      .from('fcm_subscriptions')
      .select('token')
      .eq('company_id', companyId)
      .eq('is_active', true)

    if (error) {

      console.error('Token fetch error:', error)

      return NextResponse.json(
        { error: 'Token fetch failed' },
        { status: 500 }
      )

    }

    if (!tokens || tokens.length === 0) {

      return NextResponse.json({
        success: true,
        sent: 0
      })

    }

    const messaging = firebaseAdmin.messaging()

    /* Send notification */

    const response = await messaging.sendEachForMulticast({

      tokens: tokens.map((t: any) => t.token),

      notification: {
        title,
        body: messageBody
      },

      data: {
        title,
        body: messageBody,
        url: url || '/'
      }

    })

    console.log('Push sent:', response.successCount)

    return NextResponse.json({
      success: true,
      sent: response.successCount
    })

  } catch (err) {

    console.error('Push send error:', err)

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )

  }

}