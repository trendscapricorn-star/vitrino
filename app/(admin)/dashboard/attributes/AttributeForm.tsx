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
  categoryName: string
  categoryImageUrl?: string
  existingAttributes: { name: string }[]
  attribute?: Attribute
  onClose: () => void
}

export default function AttributeForm({
  categoryId,
  categoryName,
  categoryImageUrl,
  existingAttributes,
  attribute = null,
  onClose,
}: AttributeFormProps) {
  const supabase = supabaseBrowser
  const router = useRouter()

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])

  useEffect(() => {
    if (attribute) {
      setName(attribute.name)
    } else {
      setName('')
    }
  }, [attribute])

  /* ===============================
     MANUAL SAVE
  ================================ */

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      if (attribute) {
        const { error } = await supabase
          .from('attributes')
          .update({ name: name.trim() })
          .eq('id', attribute.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('attributes')
          .insert({
            category_id: categoryId,
            name: name.trim(),
            data_type: 'select',
            is_active: true,
          })

        if (error) throw error
      }

      onClose()
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  /* ===============================
     AI SUGGEST
  ================================ */

  async function handleAiSuggest() {
    setAiLoading(true)
    setAiSuggestions([])

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'attribute_suggestion',
          category: categoryName,
          existingAttributes,
          imageUrl: categoryImageUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert('AI Error')
        console.error(data)
        return
      }

      setAiSuggestions(data.suggested_attributes || [])
    } catch (err) {
      alert('AI failed')
    } finally {
      setAiLoading(false)
    }
  }

  /* ===============================
     CREATE AI ATTRIBUTE
  ================================ */

  async function createAiAttribute(suggestion: any) {
    try {
      const { data: newAttr, error } = await supabase
        .from('attributes')
        .insert({
          category_id: categoryId,
          name: suggestion.name,
          data_type: 'select',
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      if (suggestion.options?.length) {
        const optionsToInsert = suggestion.options.map((opt: string) => ({
          attribute_id: newAttr.id,
          value: opt,
        }))

        await supabase.from('attribute_options').insert(optionsToInsert)
      }

      router.refresh()

      setAiSuggestions((prev) =>
        prev.filter((a) => a.name !== suggestion.name)
      )
    } catch (err: any) {
      alert(err.message || 'Failed to create')
    }
  }

  /* ===============================
     UI
  ================================ */

  return (
    <div className="space-y-4">

      {/* Manual Form */}
      <form
        onSubmit={handleSubmit}
        className="border p-4 rounded bg-white"
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
            className="bg-black text-white px-4 py-2 rounded"
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

      {/* AI Button (Only when creating new attribute) */}
      {!attribute && (
        <div className="border p-4 rounded bg-gray-50">
          <button
            onClick={handleAiSuggest}
            disabled={aiLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {aiLoading
              ? 'Analyzing...'
              : 'Suggest Attributes with AI'}
          </button>
        </div>
      )}

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="space-y-3">
          {aiSuggestions.map((s, index) => (
            <div
              key={index}
              className="border p-3 rounded bg-white"
            >
              <div className="font-semibold">
                {s.name}
              </div>

              <div className="text-sm text-gray-600 mb-2">
                Options: {s.options?.join(', ')}
              </div>

              <button
                onClick={() => createAiAttribute(s)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Create
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}