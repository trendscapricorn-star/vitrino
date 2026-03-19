import { notFound } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import FilterSidebar from "./components/FilterSidebar"
import InstallButton from "./components/InstallButton"
import VisitorGate from "./components/VisitorGate"
import PushRegister from "./components/PushRegister"

const PAGE_SIZE = 12

/* ---------------- TYPES ---------------- */

type Company = {
  id: string
  display_name: string
  phone: string | null
  email: string | null
  whatsapp: string | null
  address: string | null
}

type Category = {
  id: string
  name: string
}

type Attribute = {
  id: string
  name: string
  attribute_options: {
    id: string
    value: string
  }[]
}

type Product = {
  id: string
  name: string
  slug: string
  base_price: number | null
  image_url: string | null
}

/* ---------------- PAGE ---------------- */

export default async function PublicCatalog({
  params,
  searchParams
}: {
  params: { slug: string }
  searchParams: Record<string, string | string[] | undefined>
}) {

  const supabase = await createSupabaseServerClient()
  const slug = params?.slug

  if (!slug) notFound()

  /* ---------------- COMPANY ---------------- */

  const { data: companyRaw } = await supabase
    .rpc("get_company_by_slug", { p_slug: slug })
    .single()

  const company = companyRaw as Company | null

  if (!company) notFound()

  /* ---------------- SUBSCRIPTION ---------------- */

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, trial_ends_at, current_period_end")
    .eq("company_id", company.id)
    .maybeSingle()

  const now = new Date()

  const isValid =
    (subscription?.status === "trialing" &&
      subscription?.trial_ends_at &&
      new Date(subscription.trial_ends_at) > now) ||
    (subscription?.status === "active" &&
      subscription?.current_period_end &&
      new Date(subscription.current_period_end) > now)

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <div className="text-lg font-semibold text-red-600">
            Catalogue Not Available
          </div>
        </div>
      </div>
    )
  }

  /* ---------------- CATEGORIES ---------------- */

  const { data: categoriesRaw } = await supabase
    .from("categories")
    .select("id, name")
    .eq("company_id", company.id)
    .order("sort_order", { ascending: true })

  const categories = (categoriesRaw || []) as Category[]

  if (!categories.length) {
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

  const { data: attributesRaw } = await supabase
    .from("attributes")
    .select(`
      id,
      name,
      attribute_options (id, value)
    `)
    .eq("category_id", selectedCategory)
    .order("sort_order", { ascending: true })

  const attributes = (attributesRaw || []) as Attribute[]

  /* ---------------- PRODUCTS (RPC) ---------------- */

  const from = (page - 1) * PAGE_SIZE

  const { data: productsRaw } = await supabase.rpc("get_products_filtered", {
    p_company_id: company.id,
    p_category_id: selectedCategory,
    p_option_ids: selectedOptions.length ? selectedOptions : null,
    p_sort: sort,
    p_limit: PAGE_SIZE,
    p_offset: from
  })

  const products = (productsRaw || []) as Product[]

  /* ---------------- UI ---------------- */

  return (
    <VisitorGate companyId={company.id}>
      <PushRegister companyId={company.id} />

      <div className="bg-zinc-50 min-h-screen">

        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b">

          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

            <div>
              <div className="font-semibold text-lg">
                {company.display_name}
              </div>
              <div className="text-xs text-gray-500">
                Live Catalogue
              </div>
            </div>

            <div className="flex gap-2">

              <button
                onClick={() => {
                  if (typeof window !== "undefined" && navigator.share) {
                    navigator.share({
                      title: company.display_name,
                      url: window.location.href
                    })
                  }
                }}
                className="px-3 py-1 border rounded text-sm"
              >
                Share
              </button>

              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(window.location.href)
                  }
                }}
                className="px-3 py-1 bg-black text-white rounded text-sm"
              >
                Copy Link
              </button>

            </div>

          </div>

          {/* CATEGORY TABS */}
          <div className="overflow-x-auto flex gap-2 px-4 pb-2">

            {categories.map((c) => (
              <a
                key={c.id}
                href={`/${slug}?category=${c.id}`}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  c.id === selectedCategory
                    ? "bg-black text-white"
                    : "bg-gray-200"
                }`}
              >
                {c.name}
              </a>
            ))}

          </div>

        </div>

        {/* MAIN */}

        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">

          {/* SIDEBAR */}
          <div className="hidden md:block col-span-3">
            <FilterSidebar
              slug={slug}
              categories={categories}
              attributes={attributes}
              selectedCategory={selectedCategory}
              selectedOptions={selectedOptions}
              sort={sort}
            />
          </div>

          {/* PRODUCTS */}
          <div className="col-span-12 md:col-span-9">

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

              {products.map((p) => {

                const productUrl = `${slug}/${p.slug}`
                const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${productUrl}`

                return (
                  <div key={p.id} className="bg-white rounded border overflow-hidden">

                    <a href={`/${productUrl}`}>

                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          className="w-full h-56 object-cover"
                        />
                      ) : (
                        <div className="h-56 bg-gray-100 flex items-center justify-center text-xs">
                          No Image
                        </div>
                      )}

                      <div className="p-2">
                        <div className="text-sm font-medium truncate">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          ₹ {p.base_price ?? "-"}
                        </div>
                      </div>

                    </a>

                    {/* WHATSAPP SHARE */}
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `${p.name} - ₹${p.base_price}\n${fullUrl}`
                      )}`}
                      target="_blank"
                      className="block text-center text-xs py-2 border-t bg-green-50"
                    >
                      Share on WhatsApp
                    </a>

                  </div>
                )
              })}

            </div>

          </div>

        </div>

        {/* CONTACT BUTTON */}
        {company.whatsapp && (
          <a
            href={`https://wa.me/${company.whatsapp}`}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg"
          >
            Contact on WhatsApp
          </a>
        )}

        <InstallButton />

      </div>
    </VisitorGate>
  )
}