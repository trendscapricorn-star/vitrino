import { notFound } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import FilterSidebar from "./components/FilterSidebar"
import InstallButton from "./components/InstallButton"
import VisitorGate from "./components/VisitorGate"
import PushRegister from "./components/PushRegister"

const PAGE_SIZE = 12

type Company = {
  id: string
  display_name: string
  phone: string | null
  email: string | null
  whatsapp: string | null
  address: string | null
}

export default async function PublicCatalog(props: any) {

  const params = props.params
  const searchParams = props.searchParams

  const supabase = await createSupabaseServerClient()

  const slug = params?.slug

  if (!slug) notFound()

  /* ---------------- COMPANY ---------------- */

  const { data: companyData } = await supabase
    .rpc("get_company_by_slug", { p_slug: slug })
    .single()   // ✅ KEEP THIS

  const company = companyData as Company

  // ✅ Safe guard (no breaking change)
  if (!company || !company.id) {
    console.log("Company fetch failed:", companyData)
    notFound()
  }

  /* ---------------- SUBSCRIPTION ---------------- */

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="bg-white p-10 rounded-xl shadow text-left max-w-xl">
          <div className="text-xl font-semibold mb-4 text-red-600">
            Account Suspended
          </div>
        </div>
      </div>
    )
  }

  /* ---------------- CATEGORIES ---------------- */

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

  /* ---------------- ATTRIBUTES ---------------- */

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

  /* ---------------- PRODUCTS ---------------- */

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

  if (sort === "price_asc")
    query = query.order("base_price", { ascending: true })
  else if (sort === "price_desc")
    query = query.order("base_price", { ascending: false })
  else if (sort === "name_asc")
    query = query.order("name", { ascending: true })
  else if (sort === "name_desc")
    query = query.order("name", { ascending: false })
  else
    query = query.order("sort_order", { ascending: true })

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: products, count } = await query.range(from, to)

  const selectedCategoryName =
    categories.find(c => c.id === selectedCategory)?.name || ""

  /* ---------------- UI ---------------- */

  return (
    <VisitorGate companyId={company.id}>
      <PushRegister companyId={company.id} />

      <div className="bg-zinc-50">

        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">

            <div className="text-sm text-gray-500">
              {company.display_name} / {selectedCategoryName}
            </div>

            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(window.location.href)
                }
              }}
              className="text-sm px-3 py-1 border rounded"
            >
              Copy Link
            </button>

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

                {products?.map((p: any) => {

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
                          alt={p.name}
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
                          ₹ {p.base_price ?? "-" }
                        </div>

                      </div>

                    </a>
                  )
                })}

              </div>

            </div>

          </div>

        </div>

        <InstallButton />

      </div>
    </VisitorGate>
  )
}