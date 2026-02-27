'use client'

import { useState } from 'react'
import CategoryForm from './CategoryForm'
import { createClient } from '@supabase/supabase-js'

/* 🔹 Types */

type Category = {
  id: string
  name: string
  sort_order: number
  is_active: boolean
}

interface CategoriesListProps {
  categories: Category[]
  companyId: string
}

export default function CategoriesList({
  categories,
  companyId,
}: CategoriesListProps) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [showForm, setShowForm] = useState<boolean>(false)
  const [editCategory, setEditCategory] =
    useState<Category | null>(null)

  async function toggleActive(category: Category) {
    await supabase
      .from('categories')
      .update({ is_active: !category.is_active })
      .eq('id', category.id)

    window.location.reload()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          Categories
        </h1>

        <button
          onClick={() => {
            setEditCategory(null)
            setShowForm(true)
          }}
          className="bg-black text-white px-4 py-2 rounded hover:opacity-90"
        >
          Add Category
        </button>
      </div>

      {showForm && (
        <CategoryForm
          companyId={companyId}
          category={editCategory}
          onClose={() => setShowForm(false)}
        />
      )}

      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`border p-4 rounded flex justify-between ${
              !cat.is_active ? 'opacity-50' : ''
            }`}
          >
            <div>
              <div className="font-medium">
                {cat.name}
              </div>
              <div className="text-sm text-gray-500">
                Order: {cat.sort_order}
              </div>
            </div>

            <div className="flex gap-3 text-sm">
              <button
                onClick={() => {
                  setEditCategory(cat)
                  setShowForm(true)
                }}
                className="text-blue-600"
              >
                Edit
              </button>

              <button
                onClick={() => toggleActive(cat)}
                className="text-red-600"
              >
                {cat.is_active
                  ? 'Disable'
                  : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}