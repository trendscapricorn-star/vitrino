export const runtime = 'edge'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import ProductsList from './ProductsList'

export default async function ProductsPage() {
  const supabase = await createSupabaseServerClient()

  // 🔐 Validate user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 🏢 Get company
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!company) redirect('/dashboard/setup')

  // 📦 Get products WITH images + variants
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      categories(name),
      product_images (
        id,
        image_url,
        sort_order
      ),
      variants (
        id
      )
    `)
    .eq('company_id', company.id)
    .order('sort_order', { ascending: true })

  // 📂 Get categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('company_id', company.id)
    .order('sort_order', { ascending: true })

  // 🧬 Get attributes (category scoped)
  const { data: attributes } = await supabase
    .from('attributes')
    .select('*')
    .in(
      'category_id',
      categories?.map((c) => c.id) ?? []
    )
    .order('sort_order', { ascending: true })

  return (
    <ProductsList
      products={products || []}
      categories={categories || []}
      attributes={attributes || []}
      companyId={company.id}
    />
  )
}