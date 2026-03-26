'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import AttributeSelect from './AttributeSelect'
import type { Product } from '@/types/product'

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
}

type AttributeValueMap = {
  [attributeId: string]: string
}

export default function ProductForm({
  product,
  categories,
  attributes,
  companyId,
}: ProductFormProps) {

  const supabase = supabaseBrowser

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [attributeValues, setAttributeValues] = useState<AttributeValueMap>({})
  const [draftProduct, setDraftProduct] = useState<Product | null>(product)
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved'>('saved')

  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const categoryAttributes = attributes.filter(
    (attr) => attr.category_id === categoryId
  )

  const isReady = !!categoryId

  // INIT
  useEffect(() => {
    if (product) {
      setDraftProduct(product)
      setName(product.name)
      setCategoryId(product.category_id)
      setPrice(product.base_price?.toString() || '')
      setDescription(product.description || '')

      loadExistingAttributes(product.id)
      loadImages(product.id)
    } else {
      setDraftProduct(null)
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

  async function createDraftProduct(initialName?: string, initialCategory?: string) {
    const { data, error } = await supabase
      .from("products")
      .insert({
        company_id: companyId,
        name: initialName || "Untitled Product",
        category_id: initialCategory,
        has_variants: false,
      })
      .select()
      .single()

    if (error) {
      alert(error.message)
      return null
    }

    return data
  }

  async function loadImages(productId: string) {
    const { data } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order')

    setImages(data || [])
  }

  // AUTO SAVE BASIC
  useEffect(() => {
    if (!draftProduct?.id) return

    const timeout = setTimeout(async () => {
      setSaveStatus('saving')

      await supabase
        .from("products")
        .update({
          name,
          category_id: categoryId,
          base_price: price ? Number(price) : null,
          description,
        })
        .eq("id", draftProduct.id)

      setSaveStatus('saved')
    }, 600)

    return () => clearTimeout(timeout)
  }, [name, categoryId, price, description, draftProduct?.id])

  // AUTO SAVE ATTRIBUTES
  useEffect(() => {
    if (!draftProduct?.id) return

    const timeout = setTimeout(async () => {
      setSaveStatus('saving')

      const productId = draftProduct.id

      await supabase
        .from("product_attribute_values")
        .delete()
        .eq("product_id", productId)

      const attributeRows = Object.entries(attributeValues)
        .filter(([_, optionId]) => optionId)
        .map(([attrId, optionId]) => ({
          product_id: productId,
          attribute_id: attrId,
          option_id: optionId,
        }))

      if (attributeRows.length) {
        await supabase
          .from("product_attribute_values")
          .insert(attributeRows)
      }

      setSaveStatus('saved')
    }, 600)

    return () => clearTimeout(timeout)
  }, [attributeValues, draftProduct?.id])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (images.length >= 4) {
      alert("Maximum 4 images allowed")
      return
    }

    let currentProduct = draftProduct

    if (!currentProduct) {
      const newDraft = await createDraftProduct(name, categoryId)
      if (!newDraft) return
      setDraftProduct(newDraft)
      currentProduct = newDraft
    }

    if (!currentProduct) return

    const fileExt = file.name.split(".").pop()
    const fileName = `${currentProduct.id}/${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file)

    if (error) {
      alert("Upload failed")
      return
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName)

    await supabase
      .from("product_images")
      .insert({
        product_id: currentProduct.id,
        image_url: data.publicUrl,
        sort_order: images.length,
      })

    loadImages(currentProduct.id)
  }

  async function deleteImage(id: string, imageUrl: string) {
    if (!draftProduct?.id) return

    await supabase
      .from("product_images")
      .delete()
      .eq("id", id)

    const path = imageUrl.split("/product-images/")[1]

    if (path) {
      await supabase.storage
        .from("product-images")
        .remove([path])
    }

    loadImages(draftProduct.id)
  }

  return (
    <form className="border p-5 rounded bg-white max-w-6xl">

      {!categoryId && (
        <div className="text-sm text-gray-500 mb-3">
          Select category first to start creating product
        </div>
      )}

      <div className="text-xs text-gray-500 mb-2">
        Changes are saved automatically
      </div>

      <div className="text-xs mb-4">
        {saveStatus === 'saving' && <span>Saving...</span>}
        {saveStatus === 'saved' && <span className="text-green-600">✓ Saved</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">

        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Design name"
          className="border px-3 py-2 w-full"
          disabled={!isReady}
        />

        <select
          required
          value={categoryId}
          onChange={async (e) => {
            const value = e.target.value
            setCategoryId(value)

            if (!draftProduct) {
              const newDraft = await createDraftProduct(name, value)
              if (newDraft) setDraftProduct(newDraft)
            }
          }}
          className="border px-3 py-2 w-full"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Base Price"
          className="border px-3 py-2 w-full"
          disabled={!isReady}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="border px-3 py-2 w-full"
          disabled={!isReady}
        />

      </div>

      {/* IMAGES */}
      <div className="mt-6">

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={!draftProduct}
        />

        {images.length >= 4 && (
          <div className="text-xs text-gray-500 mt-2">
            Maximum 4 images reached
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mt-4">

          {images.map((img) => (
            <div key={img.id} className="relative group">

              <img
                src={img.image_url}
                className="w-full h-24 object-cover rounded border"
              />

              <button
                type="button"
                onClick={() => deleteImage(img.id, img.image_url)}
                className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>

            </div>
          ))}

        </div>

      </div>

    </form>
  )
}