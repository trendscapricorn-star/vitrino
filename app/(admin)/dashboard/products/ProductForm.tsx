'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import AttributeSelect from './AttributeSelect'
import { uploadProductImage } from '@/lib/upload-image'

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

type Product = {
  id: string
  name: string
  category_id: string
  base_price: number | null
  description: string | null
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

  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0)
  const [name, setName] = useState<string>('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [attributeValues, setAttributeValues] =
    useState<AttributeValueMap>({})
  const [imageSlots, setImageSlots] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ])
  const [existingImages, setExistingImages] =
    useState<ProductImage[]>([])
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
      loadExistingImages(product.id)
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

  async function loadExistingImages(productId: string) {
    const { data } = await supabase
      .from('product_images')
      .select('id, image_url, sort_order')
      .eq('product_id', productId)
      .order('sort_order')

    setExistingImages(data || [])
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

    /* Upload images */
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
        { onConflict: 'product_id,sort_order' }
      )
    }

    setLoading(false)
    window.location.reload()
  }

  /* ---------------- UI ---------------- */

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-6 rounded bg-white max-w-6xl mx-auto"
    >
      {/* UI trimmed here for brevity — your JSX remains the same */}
    </form>
  )
}