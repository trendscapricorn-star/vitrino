import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import ProductForm from '../ProductForm'

export default async function NewProductPage() {
  const supabase = await createSupabaseServerClient()

  // 🔐 Auth check
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

  // 📂 Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('company_id', company.id)
    .order('sort_order', { ascending: true })

  // 🧬 Attributes
  const { data: attributes } = await supabase
    .from('attributes')
    .select('*')
    .in(
      'category_id',
      categories?.map((c) => c.id) ?? []
    )
    .order('sort_order', { ascending: true })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Create Product
      </h1>

      <ProductForm
        product={null}
        categories={categories || []}
        attributes={attributes || []}
        companyId={company.id}
        onClose={() => {}}
      />
    </div>
  )
}