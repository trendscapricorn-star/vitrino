export const runtime = 'edge'

import SetupForm from './SetupForm'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function SetupPage() {
  const cookieStore = await cookies() // ✅ FIX

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
      },
    }
  )

  /* ---------- GET USER ---------- */

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  /* ---------- CHECK DISTRIBUTOR ---------- */

  const { data: distributor } = await supabase
    .from('distributors')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (distributor) {
    redirect('/distributor')
  }

  /* ---------- CHECK COMPANY ---------- */

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (company) {
    redirect('/dashboard')
  }

  return <SetupForm />
}