'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import AttributeForm from './AttributeForm'
import AttributeOptionsManager from './AttributeOptionsManager'

export default function AttributesList({
  categories,
  attributes,
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [selectedCategory, setSelectedCategory] = useState('')
  const [editAttribute, setEditAttribute] = useState(null)

  const filteredAttributes = attributes.filter(
    (a) =>
      a.category_id === selectedCategory
  )

  async function toggleAttribute(attr) {
    await supabase
      .from('attributes')
      .update({ is_active: !attr.is_active })
      .eq('id', attr.id)

    window.location.reload()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Attributes
      </h1>

      <select
        value={selectedCategory}
        onChange={(e) =>
          setSelectedCategory(e.target.value)
        }
        className="border px-3 py-2 mb-4"
      >
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {selectedCategory && (
        <>
          <AttributeForm
            categoryId={selectedCategory}
            attribute={editAttribute}
            onClose={() => setEditAttribute(null)}
          />

          <div className="space-y-3 mt-4">
            {filteredAttributes.map((attr) => (
              <div
                key={attr.id}
                className={`border p-4 rounded ${
                  !attr.is_active
                    ? 'opacity-50'
                    : ''
                }`}
              >
                <div className="flex justify-between">
                  <div className="font-medium">
                    {attr.name}
                  </div>

                  <div className="flex gap-3 text-sm">
                    <button
                      onClick={() =>
                        setEditAttribute(attr)
                      }
                      className="text-blue-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        toggleAttribute(attr)
                      }
                      className="text-red-600"
                    >
                      {attr.is_active
                        ? 'Disable'
                        : 'Enable'}
                    </button>
                  </div>
                </div>

                <AttributeOptionsManager
                  attributeId={attr.id}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}