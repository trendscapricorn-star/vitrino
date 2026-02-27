'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function VariantManager({
  product,
  companyId,
  onBack,
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [variants, setVariants] = useState([])

  async function loadVariants() {
    const { data } = await supabase
      .from('variants')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at')

    setVariants(data || [])
  }

  useEffect(() => {
    loadVariants()
  }, [])

  async function updateVariant(id, field, value) {
    await supabase
      .from('variants')
      .update({ [field]: value })
      .eq('id', id)

    loadVariants()
  }

  async function toggleVariant(variant) {
    await supabase
      .from('variants')
      .update({ is_active: !variant.is_active })
      .eq('id', variant.id)

    loadVariants()
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 text-sm"
      >
        ← Back
      </button>

      <h2 className="text-xl font-semibold mb-4">
        {product.name}
      </h2>

      <div className="space-y-3">
        {variants.map((v) => (
          <div
            key={v.id}
            className={`border p-4 rounded flex justify-between items-center ${
              !v.is_active ? 'opacity-50' : ''
            }`}
          >
            <div className="flex flex-col gap-2">
              <input
                value={v.name}
                onChange={(e) =>
                  updateVariant(
                    v.id,
                    'name',
                    e.target.value
                  )
                }
                className="border px-2 py-1 text-sm"
              />

              <input
                type="number"
                value={v.price ?? ''}
                onChange={(e) =>
                  updateVariant(
                    v.id,
                    'price',
                    e.target.value
                      ? Number(e.target.value)
                      : null
                  )
                }
                placeholder="Price override"
                className="border px-2 py-1 text-sm"
              />
            </div>

            <button
              onClick={() =>
                toggleVariant(v)
              }
              className="text-red-600 text-sm"
            >
              {v.is_active
                ? 'Disable'
                : 'Enable'}
            </button>
          </div>
        ))}

        {variants.length === 0 && (
          <div className="text-gray-500">
            No variants found.
          </div>
        )}
      </div>
    </div>
  )
}