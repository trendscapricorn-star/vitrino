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

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [attributeValues, setAttributeValues] =
    useState<AttributeValueMap>({})
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

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
      loadImages(product.id)
    } else {
      setName('')
      setCategoryId('')
      setPrice('')
      setDescription('')
      setAttributeValues({})
      setImages([])
    }
  }, [product])

  async function loadExistingAttributes(productId: string) {
    const { data } = await supabase
      .from('product_attribute_values')
      .select('attribute_id, option_id')
      .eq('product_id', productId)

    const map: AttributeValueMap = {}

    data?.forEach((row: any) => {
      map[row.attribute_id] = row.option_id
    })

    setAttributeValues(map)
  }

  async function loadImages(productId: string) {
    const { data } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order')

    setImages(data || [])
  }

  /* ---------------- IMAGE UPLOAD ---------------- */

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!product?.id) {
      alert('Save product first before uploading images')
      return
    }

    if (images.length >= 4) {
      alert('Maximum 4 images allowed')
      return
    }

    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${product.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file)

    if (uploadError) {
      console.error(uploadError)
      setUploading(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    await supabase.from('product_images').insert({
      product_id: product.id,
      image_url: publicUrl,
      sort_order: images.length,
    })

    setUploading(false)
    loadImages(product.id)
  }

  async function deleteImage(imageId: string) {
    if (!product?.id) return

    await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)

    loadImages(product.id)
  }

  /* ---------------- SUBMIT ---------------- */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()
    setLoading(true)

    let productId: string

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
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { data: newProduct, error } =
        await supabase
          .from('products')
          .insert({
            company_id: companyId,
            category_id: categoryId,
            name,
            slug,
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

    /* Save attribute values */
    for (const attrId in attributeValues) {
      const optionId = attributeValues[attrId]
      if (!optionId) continue

      await supabase
        .from('product_attribute_values')
        .insert({
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

        {/* ---------------- ATTRIBUTES ---------------- */}

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

        {/* ---------------- IMAGES ---------------- */}

        <div className="pt-4">
          <label className="block mb-2 font-medium">
            Product Images (Max 4)
          </label>

          {product && (
            <>
              <label className="cursor-pointer bg-black text-white px-4 py-2 rounded">
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <div className="grid grid-cols-4 gap-4 mt-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative group border rounded overflow-hidden"
                  >
                    <img
                      src={img.image_url}
                      className="w-full h-28 object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => deleteImage(img.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {!product && (
            <p className="text-sm text-gray-500 mt-2">
              Save product first to upload images
            </p>
          )}
        </div>

        {/* ---------------- BUTTONS ---------------- */}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-5 py-2 rounded"
          >
            {loading
              ? 'Saving...'
              : product
              ? 'Update'
              : 'Save'}
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