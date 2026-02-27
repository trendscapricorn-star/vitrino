'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import AttributeSelect from './AttributeSelect'
import { uploadProductImage } from '@/lib/upload-image'

export default function ProductForm({
  product,
  categories,
  attributes,
  companyId,
  onClose,
}) {
  const supabase = supabaseBrowser

  const [activePreviewIndex, setActivePreviewIndex] = useState(0)
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [attributeValues, setAttributeValues] = useState({})
  const [imageSlots, setImageSlots] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ])
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const categoryAttributes = attributes.filter(
    (a) => a.category_id === categoryId
  )

  // ----------------------------
  // LOAD PRODUCT (EDIT MODE)
  // ----------------------------
  useEffect(() => {
    if (product) {
      setName(product.name)
      setCategoryId(product.category_id)
      setPrice(product.base_price ?? '')
      setDescription(product.description ?? '')
      loadExistingAttributes(product.id)
      loadExistingImages(product.id)
    }
  }, [product])

  async function loadExistingAttributes(productId: string) {
    const { data } = await supabase
      .from('product_attribute_values')
      .select('*')
      .eq('product_id', productId)

    const map: any = {}
    data?.forEach((row) => {
      map[row.attribute_id] = row.option_id
    })

    setAttributeValues(map)
  }

  async function loadExistingImages(productId: string) {
    const { data } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order')

    setExistingImages(data || [])
  }

  // ----------------------------
  // SUBMIT
  // ----------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    let productId: string

    // UPDATE
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
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert({
          company_id: companyId,
          category_id: categoryId,
          name,
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
    }

    // SAVE ATTRIBUTE VALUES
    for (const attrId in attributeValues) {
      const optionId = attributeValues[attrId]
      if (!optionId) continue

      await supabase.from('product_attribute_values').insert({
        product_id: productId,
        attribute_id: attrId,
        option_id: optionId,
      })
    }

    // IMAGE SLOT UPLOAD
    for (let i = 0; i < 4; i++) {
      const file = imageSlots[i]
      if (!file) continue

      const imageUrl = await uploadProductImage({
        file,
        companyId,
        productId,
      })

      await supabase.from('product_images').upsert(
        {
          product_id: productId,
          image_url: imageUrl,
          sort_order: i,
          is_primary: i === 0,
        },
        {
          onConflict: 'product_id,sort_order',
        }
      )
    }

    setLoading(false)
    window.location.reload()
  }

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <form
      onSubmit={handleSubmit}
      className="border p-6 rounded bg-white max-w-6xl mx-auto"
    >
      <div className="grid grid-cols-2 gap-10">

        {/* LEFT SIDE */}
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
            maxLength={150}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            className="border px-3 py-2 w-full"
          />

          {/* ATTRIBUTES */}
          {categoryAttributes.map((attr) => (
            <div key={attr.id}>
              <label className="block mb-1">{attr.name}</label>

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

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* LARGE PREVIEW */}
          <div className="border rounded bg-gray-50 p-6 flex items-center justify-center min-h-[500px]">
            {imageSlots[activePreviewIndex] ? (
              <img
                src={URL.createObjectURL(
                  imageSlots[activePreviewIndex] as File
                )}
                className="max-h-[480px] object-contain"
              />
            ) : existingImages.find(
                (img) => img.sort_order === activePreviewIndex
              ) ? (
              <img
                src={
                  existingImages.find(
                    (img) => img.sort_order === activePreviewIndex
                  )?.image_url
                }
                className="max-h-[480px] object-contain"
              />
            ) : (
              <div className="text-gray-400 text-sm">
                No Image
              </div>
            )}
          </div>

          {/* IMAGE ROWS */}
<div className="space-y-3">
  {[0, 1, 2, 3].map((slot) => {
    const existing = existingImages.find(
      (img) => img.sort_order === slot
    )

    const newFile = imageSlots[slot]
    const hasImage = newFile || existing

    return (
      <div
        key={slot}
        className="flex items-center justify-between border rounded px-4 py-3 bg-white"
      >
        <div
          className={`cursor-pointer ${
            activePreviewIndex === slot
              ? 'font-semibold text-black'
              : 'text-gray-600'
          }`}
          onClick={() => setActivePreviewIndex(slot)}
        >
          Image {slot + 1}
          {slot === 0 && (
            <span className="text-xs text-gray-400 ml-2">
              (Primary)
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">

          {!hasImage && (
            <label className="cursor-pointer text-blue-600 underline text-sm">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (!e.target.files) return
                  const file = e.target.files[0]

                  setImageSlots((prev) => {
                    const updated = [...prev]
                    updated[slot] = file
                    return updated
                  })

                  setActivePreviewIndex(slot)
                }}
              />
            </label>
          )}

          {hasImage && (
            <>
              <button
                type="button"
                onClick={() => setActivePreviewIndex(slot)}
                className="text-sm text-blue-600 underline"
              >
                View
              </button>

              <label className="cursor-pointer text-sm text-gray-600 underline">
                Replace
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (!e.target.files) return
                    const file = e.target.files[0]

                    setImageSlots((prev) => {
                      const updated = [...prev]
                      updated[slot] = file
                      return updated
                    })

                    setActivePreviewIndex(slot)
                  }}
                />
              </label>
            </>
          )}

        </div>
      </div>
    )
  })}
</div>
        </div>

      </div>
    </form>
  )
}