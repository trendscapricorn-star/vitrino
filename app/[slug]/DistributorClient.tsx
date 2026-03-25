"use client"

import { useState } from "react"

/* ---------------- TYPES ---------------- */

type Distributor = {
  id: string
  name: string
}

type Company = {
  id: string
  display_name: string
  logo_url: string | null
}

type Product = {
  id: string
  name: string
  base_price: number
  product_images?: { image_url: string }[]
}

/* ---------------- COMPONENT ---------------- */

export default function DistributorClient({
  distributor,
  companies,
}: {
  distributor: Distributor
  companies: Company[]
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadProducts(companyId: string) {
    setSelectedCompany(companyId)
    setLoading(true)

    try {
      const res = await fetch(`/api/products?company_id=${companyId}`)
      const data = await res.json()

      setProducts(data || [])
    } catch (err) {
      console.error("Failed to load products", err)
      setProducts([])
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">

      {/* HEADER */}
      <h1 className="text-2xl font-semibold mb-6">
        {distributor.name}
      </h1>

      <h2 className="text-lg font-medium mb-4">
        Available Brands
      </h2>

      {/* 🔥 BRAND GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">

        {companies.map((c) => (
          <div
            key={c.id}
            onClick={() => loadProducts(c.id)}
            className={`border rounded-lg p-4 text-center cursor-pointer hover:shadow transition ${
              selectedCompany === c.id ? "border-black" : ""
            }`}
          >
            <div className="h-24 flex items-center justify-center mb-2">
              {c.logo_url ? (
                <img
                  src={c.logo_url}
                  alt={c.display_name}
                  className="max-h-full object-contain"
                />
              ) : (
                <span className="text-zinc-400 text-sm">
                  No Logo
                </span>
              )}
            </div>

            <p className="text-sm font-medium">
              {c.display_name}
            </p>
          </div>
        ))}

      </div>

      {/* 🔥 PRODUCTS */}
      {selectedCompany && (
        <div>

          <h2 className="text-lg font-semibold mb-4">
            Products
          </h2>

          {loading ? (
            <p className="text-sm text-zinc-500">Loading...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No products found
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

              {products.map((p) => (
                <div key={p.id} className="border rounded p-3">

                  {/* IMAGE */}
                  <div className="h-40 bg-zinc-100 mb-2 flex items-center justify-center overflow-hidden">
                    {p.product_images?.[0]?.image_url ? (
                      <img
                        src={p.product_images[0].image_url}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-zinc-400">
                        No Image
                      </span>
                    )}
                  </div>

                  {/* NAME */}
                  <p className="text-sm font-medium">
                    {p.name}
                  </p>

                  {/* PRICE */}
                  <p className="text-sm text-zinc-500">
                    ₹ {p.base_price}
                  </p>

                </div>
              ))}

            </div>
          )}

        </div>
      )}

    </div>
  )
}