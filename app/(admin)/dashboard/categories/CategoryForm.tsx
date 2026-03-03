'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'

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
  const router = useRouter()
  const supabase = supabaseBrowser

  const [name, setName] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [loading, setLoading] = useState(false)

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

    try {
      if (category) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: name.trim(),
            sort_order: sortOrder,
          })
          .eq('id', category.id)

        if (error) {
          alert(error.message)
          return
        }
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({
            company_id: companyId,
            name: name.trim(),
            sort_order: sortOrder,
            is_active: true, // explicit for safety
          })

        if (error) {
          alert(error.message)
          return
        }
      }

      onClose()
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-4 rounded mb-6 bg-white"
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
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded hover:opacity-90"
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
          disabled={loading}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}