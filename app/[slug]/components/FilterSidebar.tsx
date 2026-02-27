'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

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

  function updateParams(newParams: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(newParams).forEach(([key, value]) => {
      if (!value) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
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
      page: null, // reset page
    })
  }

  return (
    <div className="space-y-6">

      {/* PRODUCT COUNT */}
      <div className="text-sm text-gray-500">
        {totalProducts} Products Found
      </div>

      {/* CATEGORY */}
      <div>
        <div className="font-semibold mb-2">
          Category
        </div>
        <select
          value={selectedCategory}
          onChange={(e) =>
            updateParams({
              category: e.target.value,
              attr: null,
              page: null,
            })
          }
          className="border px-3 py-2 w-full"
        >
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* ATTRIBUTES */}
      {attributes?.map((attr: any) => (
        <div key={attr.id}>
          <div className="font-semibold mb-2">
            {attr.name}
          </div>

          {attr.attribute_options?.map((opt: any) => (
            <label
              key={opt.id}
              className="flex items-center gap-2 text-sm mb-1"
            >
              <input
                type="checkbox"
                checked={selectedOptions.includes(opt.id)}
                onChange={() => toggleOption(opt.id)}
              />
              {opt.value}
            </label>
          ))}
        </div>
      ))}

      {/* SORT */}
      <div>
        <div className="font-semibold mb-2">
          Sort By
        </div>
        <select
          value={sort}
          onChange={(e) =>
            updateParams({
              sort: e.target.value,
              page: null,
            })
          }
          className="border px-3 py-2 w-full"
        >
          <option value="default">
            Default
          </option>
          <option value="price_asc">
            Price: Low → High
          </option>
          <option value="price_desc">
            Price: High → Low
          </option>
          <option value="name_asc">
            Name A → Z
          </option>
          <option value="name_desc">
            Name Z → A
          </option>
        </select>
      </div>

      {/* CLEAR FILTERS */}
      <button
        onClick={() =>
          router.push(`?category=${selectedCategory}`)
        }
        className="text-sm text-red-500 underline"
      >
        Clear Filters
      </button>

    </div>
  )
}