'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import AttributeSelect from './AttributeSelect'
import type { Product } from '@/types/product'

/* ---------------- TYPES ---------------- */

type Category = {
  id: string
  name: string
}

type Attribute = {
  id: string
  name: string
  category_id: string
}

type ProductImage = {
  id: string
  image_url: string
  sort_order: number
}

interface ProductFormProps {
  product: Product | null
  categories: Category[]
  attributes: Attribute[]
  companyId: string
  onClose: () => void
}

type AttributeValueMap = {
  [attributeId: string]: string
}

/* ---------------- COMPONENT ---------------- */

export default function ProductForm({
  product,
  categories,
  attributes,
  companyId,
  onClose,
}: ProductFormProps) {
  const supabase = supabaseBrowser

  const [name, setName] = useState<string>('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [attributeValues, setAttributeValues] =
    useState<AttributeValueMap>({})
  const [loading, setLoading] = useState<boolean>(false)

  const categoryAttributes = attributes.filter(
    (a) => a.category_id === categoryId
  )

  /* ---------------- LOAD PRODUCT ---------------- */

  useEffect(() => {
    if (product) {
      setName(product.name)
      setCategoryId(product.category_id)
      setPrice(product.base_price?.toString() || '')
      setDescription(product.description || '')
      loadExistingAttributes(product.id)
    } else {
      setName('')
      setCategoryId('')
      setPrice('')
      setDescription('')
      setAttributeValues({})
    }
  }, [product])

  async function loadExistingAttributes(productId: string) {
    const { data } = await supabase
      .from('product_attribute_values')
      .select('attribute_id, option_id')
      .eq('product_id', productId)

    const map: AttributeValueMap = {}

    data?.forEach((row: { attribute_id: string; option_id: string }) => {
      map[row.attribute_id] = row.option_id
    })

    setAttributeValues(map)
  }

  /* ---------------- SUBMIT ---------------- */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()
    setLoading(true)

    let productId: string
    let generatedSlug = ''

    if (product) {
      await supabase
        .from('products')
        .update({
          name,
          category_id: categoryId,
          base_price: price ? Number(price) : null,
          description,
        })
        .eq('id', product.id)

      productId = product.id

      await supabase
        .from('product_attribute_values')
        .delete()
        .eq('product_id', productId)
    } else {
      // 🔹 Generate slug
      generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { data: newProduct, error } = await supabase
        .from('products')
        .insert({
          company_id: companyId,
          category_id: categoryId,
          name,
          slug: generatedSlug,
          base_price: price ? Number(price) : null,
          description,
          has_variants: false,
        })
        .select()
        .single()

      if (error || !newProduct) {
        console.error(error)
        setLoading(false)
        return
      }

      productId = newProduct.id

      // 🔔 Non-blocking push trigger
      fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          title: 'New Product Added',
          body: name,
          url: `/${window.location.pathname.split('/')[1]}/${generatedSlug}`,
        }),
      }).catch(() => {})
    }

    /* Save attribute values */
    for (const attrId in attributeValues) {
      const optionId = attributeValues[attrId]
      if (!optionId) continue

      await supabase.from('product_attribute_values').insert({
        product_id: productId,
        attribute_id: attrId,
        option_id: optionId,
      })
    }

    setLoading(false)
    window.location.reload()
  }

  /* ---------------- UI ---------------- */

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-6 rounded bg-white max-w-3xl"
    >
      <div className="space-y-4">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product name"
          className="border px-3 py-2 w-full"
        />

        <select
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border px-3 py-2 w-full"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Base Price"
          className="border px-3 py-2 w-full"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
          className="border px-3 py-2 w-full"
        />

        {categoryAttributes.map((attr) => (
          <div key={attr.id}>
            <label className="block mb-1 text-sm font-medium">
              {attr.name}
            </label>

            <AttributeSelect
              attributeId={attr.id}
              value={attributeValues[attr.id] || ''}
              onChange={(value) =>
                setAttributeValues((prev) => ({
                  ...prev,
                  [attr.id]: value,
                }))
              }
            />
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-5 py-2 rounded"
          >
            {loading ? 'Saving...' : product ? 'Update' : 'Save'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="border px-5 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}