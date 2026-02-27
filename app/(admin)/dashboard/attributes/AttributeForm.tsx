'use client'

import { useState, useEffect, FormEvent } from 'react'
import { createClient } from '@supabase/supabase-js'

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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [name, setName] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

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

    if (attribute) {
      await supabase
        .from('attributes')
        .update({ name })
        .eq('id', attribute.id)
    } else {
      await supabase.from('attributes').insert({
        category_id: categoryId,
        name,
        data_type: 'select',
      })
    }

    setLoading(false)
    window.location.reload()
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
          className="bg-black text-white px-4 py-2 rounded hover:opacity-90"
          disabled={loading}
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