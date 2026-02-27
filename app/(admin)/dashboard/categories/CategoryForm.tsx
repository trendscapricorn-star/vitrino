'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

/* 🔹 Types */

type Category = {
  id: string
  name: string
  sort_order: number
}

interface CategoryFormProps {
  companyId: string
  category: Category | null
  onClose: () => void
}

export default function CategoryForm({
  companyId,
  category,
  onClose,
}: CategoryFormProps) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [name, setName] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (category) {
      setName(category.name)
      setSortOrder(category.sort_order)
    } else {
      setName('')
      setSortOrder(0)
    }
  }, [category])

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()
    setLoading(true)

    if (category) {
      await supabase
        .from('categories')
        .update({
          name,
          sort_order: sortOrder,
        })
        .eq('id', category.id)
    } else {
      await supabase
        .from('categories')
        .insert({
          company_id: companyId,
          name,
          sort_order: sortOrder,
        })
    }

    setLoading(false)
    window.location.reload()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-4 rounded mb-6"
    >
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name"
        className="border px-3 py-2 w-full mb-3 rounded"
      />

      <input
        type="number"
        value={sortOrder}
        onChange={(e) =>
          setSortOrder(Number(e.target.value))
        }
        placeholder="Sort Order"
        className="border px-3 py-2 w-full mb-3 rounded"
      />

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:opacity-90"
          disabled={loading}
        >
          {loading
            ? 'Saving...'
            : category
            ? 'Update'
            : 'Save'}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}