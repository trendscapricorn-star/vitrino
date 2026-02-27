'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function CategoryForm({
  companyId,
  category,
  onClose,
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [name, setName] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (category) {
      setName(category.name)
      setSortOrder(category.sort_order)
    }
  }, [category])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    if (category) {
      // Update
      await supabase
        .from('categories')
        .update({
          name,
          sort_order: Number(sortOrder),
        })
        .eq('id', category.id)
    } else {
      // Insert
      await supabase.from('categories').insert({
        company_id: companyId,
        name,
        sort_order: Number(sortOrder),
      })
    }

    setLoading(false)
    window.location.reload()
  }

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded mb-6">
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name"
        className="border px-3 py-2 w-full mb-3"
      />

      <input
        type="number"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        placeholder="Sort Order"
        className="border px-3 py-2 w-full mb-3"
      />

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Saving...' : category ? 'Update' : 'Save'}
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