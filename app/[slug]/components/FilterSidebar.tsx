'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState } from 'react'

export default function FilterSidebar({
  categories,
  attributes,
  selectedCategory,
  selectedOptions,
  sort,
  totalProducts,
}: any) {

  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // ✅ NEW: collapsible sections
  const [openSections, setOpenSections] = useState<any>({
    category: true,
    sort: true,
  })

  function toggleSection(key: string) {
    setOpenSections((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  function updateParams(newParams: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(newParams).forEach(([key, value]) => {
      if (!value) params.delete(key)
      else params.set(key, value)
    })

    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  function toggleOption(optionId: string) {
    const current =
      searchParams.get('attr')?.split(',') ?? []

    const exists = current.includes(optionId)

    const updated = exists
      ? current.filter((o) => o !== optionId)
      : [...current, optionId]

    updateParams({
      attr: updated.length ? updated.join(',') : null,
      page: null,
    })
  }

  return (
    <div className="space-y-6">

      {/* PRODUCT COUNT */}
      <div className="text-sm text-gray-500">
        {totalProducts} Products
      </div>

      {/* CATEGORY */}
      <div className="border rounded-lg p-3">

        <button
          onClick={() => toggleSection('category')}
          className="w-full flex justify-between items-center font-semibold"
        >
          Category
          <span>{openSections.category ? '−' : '+'}</span>
        </button>

        {openSections.category && (
          <select
            value={selectedCategory}
            onChange={(e) =>
              updateParams({
                category: e.target.value,
                attr: null,
                page: null,
              })
            }
            className="mt-3 border px-3 py-2 w-full rounded"
          >
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ATTRIBUTES */}
      {attributes?.map((attr: any) => {

        const key = `attr_${attr.id}`

        return (
          <div key={attr.id} className="border rounded-lg p-3">

            <button
              onClick={() => toggleSection(key)}
              className="w-full flex justify-between items-center font-semibold"
            >
              {attr.name}
              <span>{openSections[key] ? '−' : '+'}</span>
            </button>

            {openSections[key] && (
              <div className="mt-3 space-y-2">

                {attr.attribute_options?.map((opt: any) => {

                  const active = selectedOptions.includes(opt.id)

                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded ${
                        active ? 'bg-gray-100 font-medium' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleOption(opt.id)}
                      />
                      {opt.value}
                    </label>
                  )
                })}

              </div>
            )}

          </div>
        )
      })}

      {/* SORT */}
      <div className="border rounded-lg p-3">

        <button
          onClick={() => toggleSection('sort')}
          className="w-full flex justify-between items-center font-semibold"
        >
          Sort By
          <span>{openSections.sort ? '−' : '+'}</span>
        </button>

        {openSections.sort && (
          <select
            value={sort}
            onChange={(e) =>
              updateParams({
                sort: e.target.value,
                page: null,
              })
            }
            className="mt-3 border px-3 py-2 w-full rounded"
          >
            <option value="default">Default</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="name_asc">Name A → Z</option>
            <option value="name_desc">Name Z → A</option>
          </select>
        )}
      </div>

      {/* CLEAR */}
      <button
        onClick={() =>
          router.push(`?category=${selectedCategory}`)
        }
        className="w-full text-sm text-red-500 border border-red-200 py-2 rounded hover:bg-red-50 transition"
      >
        Clear Filters
      </button>

    </div>
  )
}