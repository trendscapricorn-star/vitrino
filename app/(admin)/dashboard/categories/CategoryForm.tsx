'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'

type Category = {
  id: string
  name: string
  sort_order: number
  image_url?: string
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
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    if (category) {
      setName(category.name)
      setSortOrder(category.sort_order)
      setImageUrl(category.image_url || '')
    } else {
      setName('')
      setSortOrder(0)
      setImageUrl('')
    }
  }, [category])

  /* ===============================
     IMAGE UPLOAD
  ================================ */

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from('category-images')
      .upload(fileName, file)

    if (error) {
      alert(error.message)
      setUploading(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from('category-images')
      .getPublicUrl(fileName)

    setImageUrl(publicUrl)
    setUploading(false)
  }

  /* ===============================
     SAVE CATEGORY
  ================================ */

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
            image_url: imageUrl,
          })
          .eq('id', category.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({
            company_id: companyId,
            name: name.trim(),
            sort_order: sortOrder,
            image_url: imageUrl,
            is_active: true,
          })

        if (error) throw error
      }

      onClose()
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  /* ===============================
     AI SUGGEST ATTRIBUTES
  ================================ */

  async function handleAiSuggest() {
    if (!imageUrl) {
      alert('Upload category image first')
      return
    }

    setAiLoading(true)

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'attribute_suggestion',
          category: name,
          existingAttributes: [],
          imageUrl: imageUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert('AI Error')
        console.error(data)
        return
      }

      console.log('AI Suggestions:', data)

      alert(
        'AI suggestions generated. Check console to review.'
      )
    } catch (err) {
      alert('AI failed')
    } finally {
      setAiLoading(false)
    }
  }

  /* ===============================
     UI
  ================================ */

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-4 rounded mb-6 bg-white space-y-4"
    >
      {/* Name */}
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name"
        className="border px-3 py-2 w-full rounded"
      />

      {/* Sort Order */}
      <input
        type="number"
        value={sortOrder}
        onChange={(e) =>
          setSortOrder(Number(e.target.value))
        }
        placeholder="Sort Order"
        className="border px-3 py-2 w-full rounded"
      />

      {/* Image Upload */}
      <div>
        <label className="block mb-2 font-medium">
          Category Image
        </label>

        <label className="cursor-pointer bg-black text-white px-4 py-2 rounded">
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        {imageUrl && (
          <div className="mt-3">
            <img
              src={imageUrl}
              className="h-32 object-cover rounded border"
            />
          </div>
        )}
      </div>

      {/* AI Suggest */}
      {imageUrl && (
        <button
          type="button"
          onClick={handleAiSuggest}
          disabled={aiLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {aiLoading
            ? 'Analyzing...'
            : 'Suggest Attributes with AI'}
        </button>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
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