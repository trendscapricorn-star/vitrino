export const runtime = 'edge'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import VariantsList from './VariantsList'

export default async function VariantsPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!company) redirect('/dashboard/setup')

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('company_id', company.id)
    .eq('has_variants', true)
    .order('created_at', { ascending: false })

  return (
    <VariantsList
      products={products || []}
      companyId={company.id}
    />
  )
}