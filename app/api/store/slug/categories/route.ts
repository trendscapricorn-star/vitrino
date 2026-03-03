import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { slug } = params

  // 1️⃣ Find company by slug
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!company) {
    return NextResponse.json(
      { error: 'Store not found' },
      { status: 404 }
    )
  }

  // 2️⃣ Fetch active categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('company_id', company.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return NextResponse.json(categories || [])
}