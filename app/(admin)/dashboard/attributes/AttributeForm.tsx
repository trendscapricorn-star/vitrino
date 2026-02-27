'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function AttributeForm({
  categoryId,
  attribute,
  onClose,
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (attribute) {
      setName(attribute.name)
    } else {
      setName('')
    }
  }, [attribute])

  async function handleSubmit(e) {
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
      className="border p-4 rounded mb-4"
    >
      <input
        required
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
        placeholder="Attribute name"
        className="border px-3 py-2 w-full mb-3"
      />

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
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
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}