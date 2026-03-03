'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'

type Attribute = {
  id: string
  name: string
} | null

interface AttributeFormProps {
  categoryId: string
  attribute?: Attribute
  onClose: () => void
}

export default function AttributeForm({
  categoryId,
  attribute = null,
  onClose,
}: AttributeFormProps) {
  const supabase = supabaseBrowser
  const router = useRouter()

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (attribute) {
      setName(attribute.name)
    } else {
      setName('')
    }
  }, [attribute])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      if (attribute) {
        const { error } = await supabase
          .from('attributes')
          .update({ name: name.trim() })
          .eq('id', attribute.id)

        if (error) {
          alert(error.message)
          console.error(error)
          return
        }
      } else {
        const { error } = await supabase
          .from('attributes')
          .insert({
            category_id: categoryId,
            name: name.trim(),
            data_type: 'select',
            is_active: true,
          })

        if (error) {
          alert(error.message)
          console.error(error)
          return
        }
      }

      onClose()
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-4 rounded mb-4 bg-white"
    >
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Attribute name"
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
            : attribute
            ? 'Update'
            : 'Save'}
        </button>

        {attribute && (
          <button
            type="button"
            onClick={onClose}
            className="border px-4 py-2 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}