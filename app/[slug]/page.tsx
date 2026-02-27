import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import FilterSidebar from './components/FilterSidebar'
import InstallButton from './components/InstallButton'

const PAGE_SIZE = 12

export default async function PublicCatalog(props: any) {
  const supabase = await createSupabaseServerClient()

  const params = await props.params
  const searchParams = await props.searchParams
  const slug = params.slug

  /* 🔹 Company */
  const { data: company } = await supabase
    .from('companies')
    .select(`
      id,
      display_name,
      phone,
      email,
      whatsapp,
      address
    `)
    .eq('slug', slug)
    .single()

  if (!company) return notFound()

  /* 🔹 Categories */
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('company_id', company.id)
    .order('sort_order', { ascending: true })

  if (!categories || categories.length === 0) {
    return <div className="p-10">No categories found.</div>
  }

  const selectedCategory =
    typeof searchParams?.category === 'string'
      ? searchParams.category
      : categories[0].id

  const selectedOptions =
    typeof searchParams?.attr === 'string'
      ? searchParams.attr.split(',')
      : []

  const sort =
    typeof searchParams?.sort === 'string'
      ? searchParams.sort
      : 'default'

  const page = Number(searchParams?.page || 1)

  /* 🔹 Attributes */
  const { data: attributes } = await supabase
    .from('attributes')
    .select(`
      id,
      name,
      attribute_options (
        id,
        value
      )
    `)
    .eq('category_id', selectedCategory)
    .order('sort_order', { ascending: true })

  /* 🔹 Products */
  let query = supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      base_price,
      sort_order,
      product_images (
        image_url,
        sort_order
      )
    `,
      { count: 'exact' }
    )
    .eq('company_id', company.id)
    .eq('category_id', selectedCategory)
    .eq('is_active', true)

  if (selectedOptions.length > 0) {
    const { data: productIds } = await supabase
      .from('product_attribute_values')
      .select('product_id')
      .in('option_id', selectedOptions)

    const ids = productIds?.map((p) => p.product_id) ?? []

    if (ids.length > 0) {
      query = query.in('id', ids)
    } else {
      query = query.in('id', [
        '00000000-0000-0000-0000-000000000000',
      ])
    }
  }

  if (sort === 'price_asc') {
    query = query.order('base_price', { ascending: true })
  } else if (sort === 'price_desc') {
    query = query.order('base_price', { ascending: false })
  } else if (sort === 'name_asc') {
    query = query.order('name', { ascending: true })
  } else if (sort === 'name_desc') {
    query = query.order('name', { ascending: false })
  } else {
    query = query.order('sort_order', { ascending: true })
  }

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: products, count } = await query.range(from, to)
  const totalPages = count
    ? Math.ceil(count / PAGE_SIZE)
    : 1

  const selectedCategoryName =
    categories.find((c: any) => c.id === selectedCategory)?.name || ''

  return (
    <div className="bg-zinc-50">

      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="text-sm text-gray-500 mb-6">
          {company.display_name} / {selectedCategoryName}
        </div>

        <div className="grid grid-cols-12 gap-8">

          <div className="col-span-3">
            <FilterSidebar
              slug={slug}
              categories={categories}
              attributes={attributes}
              selectedCategory={selectedCategory}
              selectedOptions={selectedOptions}
              sort={sort}
              totalProducts={count || 0}
            />
          </div>

          <div className="col-span-9">

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

              {products && products.length > 0 ? (
                products.map((p: any) => {
                  const primaryImage =
                    p.product_images?.find(
                      (img: any) => img.sort_order === 0
                    )?.image_url

                  return (
                    <a
                      key={p.id}
                      href={`/${slug}/${p.slug}`}
                      className="border rounded bg-white overflow-hidden hover:shadow-md transition"
                    >
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          className="w-full h-64 object-cover"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                          No Image
                        </div>
                      )}

                      <div className="p-3">
                        <div className="font-medium truncate">
                          {p.name}
                        </div>

                        <div className="text-sm text-gray-600 mt-1">
                          ₹ {p.base_price ?? '-'}
                        </div>
                      </div>
                    </a>
                  )
                })
              ) : (
                <div className="col-span-full text-center py-20">
                  <div className="text-lg font-medium mb-2">
                    No products match your selected filters
                  </div>
                  <div className="text-gray-500 text-sm">
                    Try expanding your filter options.
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>

      <InstallButton />

    </div>
  )
}