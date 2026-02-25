export const runtime = 'edge'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!company) {
    redirect('/dashboard/setup')
  }

  return <div>Dashboard</div>
}