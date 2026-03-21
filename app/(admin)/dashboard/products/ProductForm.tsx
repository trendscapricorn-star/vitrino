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
  onClose: () => void
}

type AttributeValueMap = {
  [attributeId: string]: string
}

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
  const [attributeValues, setAttributeValues] = useState<AttributeValueMap>({})

  const [images, setImages] = useState<any[]>([])
  const [pendingImages, setPendingImages] = useState<File[]>([])

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [aiFilled, setAiFilled] = useState<Record<string, boolean>>({})
  const [aiStep, setAiStep] = useState("")

  const categoryAttributes = attributes.filter(
    (attr) => attr.category_id === categoryId
  )

  useEffect(() => {

    if (product) {

      setName(product.name)
      setCategoryId(product.category_id)
      setPrice(product.base_price?.toString() || '')
      setDescription(product.description || '')

      loadExistingAttributes(product.id)
      loadImages(product.id)

      setPendingImages([])
      setAiFilled({})

    } else {

      setName('')
      setCategoryId('')
      setPrice('')
      setDescription('')
      setAttributeValues({})
      setImages([])
      setPendingImages([])
      setAiFilled({})
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

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    const file = e.target.files?.[0]
    if (!file) return

    if (images.length + pendingImages.length >= 4) {
      alert("Maximum 4 images allowed")
      return
    }

    const exists = pendingImages.find(f => f.name === file.name)

    if (exists) {
      alert("This image is already selected")
      return
    }

    setPendingImages(prev => [...prev, file])
  }

  async function deleteImage(imageId: string) {

    if (!product?.id) return

    await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId)

    loadImages(product.id)
  }

  async function handleAutoFill() {

    if (loading) return

    if (!images.length && !pendingImages.length) {
      alert("Upload at least one image first")
      return
    }

    if (!categoryId) {
      alert("Select category first")
      return
    }

    setLoading(true)
    setAiStep("Analyzing product image...")

    try {

      const firstImage =
        images[0]?.image_url ||
        URL.createObjectURL(pendingImages[0])

      setAiStep("Preparing attributes...")

      const structuredAttributes = await Promise.all(
        categoryAttributes.map(async (attr) => {

          const { data: options } = await supabase
            .from("attribute_options")
            .select("id, value")
            .eq("attribute_id", attr.id)

          return {
            id: attr.id,
            name: attr.name,
            options: options || [],
          }

        })
      )

      setAiStep("Matching attributes with AI...")

      const categoryName =
        categories.find(c => c.id === categoryId)?.name || ""

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "product_autofill",
          category: categoryName,
          existingAttributes: structuredAttributes,
          imageUrl: firstImage,
          productName: name,
          description,
        }),
      })

      if (!response.ok) {
        throw new Error("AI request failed")
      }

      const data = await response.json()

      const updatedValues: AttributeValueMap = { ...attributeValues }
      const updatedAiFilled = { ...aiFilled };

const matches = data.matched_attributes ?? []

for (const match of matches) {

  const attr = structuredAttributes.find(
    (a) => a.id === match.attribute_id
  )

  if (!attr) continue

  const option = attr.options.find(
    (o: any) => o.value === match.selected_option
  )

  if (option) {
    updatedValues[attr.id] = option.id
    updatedAiFilled[attr.id] = true
  }
}


      setAttributeValues(updatedValues)
      setAiFilled(updatedAiFilled)

    } catch (err) {

      console.error("Auto Fill Error:", err)
      alert("AI processing failed")

    }

    setLoading(false)
    setAiStep("")
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {

    e.preventDefault()
    if (loading) return

    setLoading(true)

    let productId: string

    if (product) {

      await supabase
        .from("products")
        .update({
          name,
          category_id: categoryId,
          base_price: price ? Number(price) : null,
          description,
        })
        .eq("id", product.id)

      productId = product.id

      await supabase
        .from("product_attribute_values")
        .delete()
        .eq("product_id", productId)

    } else {

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      const { data: newProduct } = await supabase
        .from("products")
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

      if (!newProduct) return

      productId = newProduct.id
    }

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

    let imageIndex = 0

    for (const file of pendingImages) {

      const fileExt = file.name.split(".").pop()
      const fileName = `${productId}/${Date.now()}_${imageIndex}.${fileExt}`

      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file)

      if (error) continue

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName)

      await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: data.publicUrl,
          sort_order: imageIndex,
        })

      imageIndex++
    }

setPendingImages([])
setLoading(false)

onClose()
  }

  return (

<form
  onSubmit={handleSubmit}
  className="border p-5 rounded bg-white max-w-6xl"
>

<div className="space-y-6">

{/* BASIC DETAILS */}

<div className="grid grid-cols-2 gap-4">

<input
required
value={name}
onChange={(e) => setName(e.target.value)}
placeholder="Design name"
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

</div>

{/* ATTRIBUTES + IMAGES */}

<div className="grid grid-cols-3 gap-6">

{/* ATTRIBUTES */}

<div className="col-span-2">

{loading && (
<div className="bg-blue-50 text-blue-700 text-sm px-3 py-2 rounded mb-3">
🤖 {aiStep}
</div>
)}

<div className="grid grid-cols-2 gap-4">

{categoryAttributes.map((attr) => (

<div key={attr.id}>

<label className="block mb-1 text-sm font-medium flex items-center gap-2">

{attr.name}

{aiFilled[attr.id] && (
<span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
AI
</span>
)}

</label>

<AttributeSelect
attributeId={attr.id}
value={attributeValues[attr.id] || ''}
disabled={loading}
onChange={(value) => {

setAttributeValues(prev => ({
...prev,
[attr.id]: value
}))

setAiFilled(prev => ({
...prev,
[attr.id]: false
}))

}}
/>

</div>

))}

</div>
</div>

{/* IMAGES */}

<div>

<label className="block mb-2 font-medium">
Product Images (Max 4)
</label>

<input
type="file"
accept="image/*"
onChange={handleImageUpload}
/>

<div className="grid grid-cols-4 gap-4 mt-4">

{images.map(img => (
<img key={img.id} src={img.image_url} />
))}

</div>

</div>

</div>

{/* AI BUTTON */}

{(images.length > 0 || pendingImages.length > 0) && (

<button
type="button"
onClick={handleAutoFill}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Generate Attributes
</button>

)}

{/* BUTTONS */}

<div className="flex gap-3 pt-6">

<button
type="submit"
className="bg-black text-white px-6 py-2 rounded"
>
{product ? "Update" : "Save"}
</button>

<button
type="button"
onClick={onClose}
className="border px-6 py-2 rounded"
>
Cancel
</button>

</div>

</div>

</form>

  )
}