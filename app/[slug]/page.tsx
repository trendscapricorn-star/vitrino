import { notFound } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import InstallButton from "./components/InstallButton"
import VisitorGate from "./components/VisitorGate"
import PushRegister from "./components/PushRegister"
import FilterWrapper from "./components/FilterWrapper"
import PdfControls from "./components/PdfControls"
import DistributorClient from "./DistributorClient"

const PAGE_SIZE = 12

type Company = {
  id: string
  display_name: string
}

export default async function PublicCatalog(props: any) {
  const params = await props.params
  const searchParams = await props.searchParams

  const supabase = await createSupabaseServerClient()

  const slug = params.slug
  if (!slug) notFound()

  const { data: companyData } = await supabase
    .rpc("get_company_by_slug", { p_slug: slug })
    .single()

  const company = companyData as Company | null

  if (company) {

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, trial_ends_at, current_period_end")
      .eq("company_id", company.id)
      .maybeSingle()

    const now = new Date()

    const isTrialValid =
      subscription?.status === "trialing" &&
      subscription?.trial_ends_at &&
      new Date(subscription.trial_ends_at) > now

    const isActiveValid =
      subscription?.status === "active" &&
      subscription?.current_period_end &&
      new Date(subscription.current_period_end) > now

    if (!isTrialValid && !isActiveValid) {
      return <div className="p-10">Account Suspended</div>
    }

    const { data: categories } = await supabase
      .from("categories")
      .select("id, name")
      .eq("company_id", company.id)
      .order("sort_order", { ascending: true })

    if (!categories || categories.length === 0) {
      return <div className="p-10">No categories found.</div>
    }

    const selectedCategory =
      typeof searchParams?.category === "string"
        ? searchParams.category
        : categories[0].id

    const selectedOptions =
      typeof searchParams?.attr === "string"
        ? searchParams.attr.split(",")
        : []

    const sort =
      typeof searchParams?.sort === "string"
        ? searchParams.sort
        : "default"

    const page =
      typeof searchParams?.page === "string"
        ? Number(searchParams.page)
        : 1

    const { data: attributes } = await supabase
      .from("attributes")
      .select(`
        id,
        name,
        attribute_options (
          id,
          value
        )
      `)
      .eq("category_id", selectedCategory)
      .order("sort_order", { ascending: true })

    let query = supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        base_price,
        sort_order,
        product_images (
          image_url,
          sort_order
        ),
        product_attribute_values (
          attribute_options (
            value
          ),
          attributes (
            name
          )
        )
      `, { count: "exact" })
      .eq("company_id", company.id)
      .eq("category_id", selectedCategory)
      .eq("is_active", true)

    if (selectedOptions.length > 0) {
      const { data: productIds } = await supabase
        .from("product_attribute_values")
        .select("product_id")
        .in("option_id", selectedOptions)

      const ids = productIds?.map(p => p.product_id) ?? []

      query =
        ids.length > 0
          ? query.in("id", ids)
          : query.in("id", ["00000000-0000-0000-0000-000000000000"])
    }

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data: products, count } = await query.range(from, to)

    return (
      <VisitorGate companyId={company.id}>
        <PushRegister companyId={company.id} />

        <div className="bg-zinc-50">
          <div className="max-w-7xl mx-auto px-6 py-8">

            {/* ✅ FIXED GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

              {/* FILTER */}
              <div className="md:col-span-3">
                <FilterWrapper
                  slug={slug}
                  categories={categories}
                  attributes={attributes}
                  selectedCategory={selectedCategory}
                  selectedOptions={selectedOptions}
                  sort={sort}
                  totalProducts={count || 0}
                />
              </div>

              {/* CONTENT */}
              <div className="md:col-span-9">
                <PdfControls
                  products={products}
                  attributes={attributes}
                  slug={slug}
                />
              </div>

            </div>

          </div>

          <InstallButton />
        </div>
      </VisitorGate>
    )
  }

  return <div>No data</div>
}