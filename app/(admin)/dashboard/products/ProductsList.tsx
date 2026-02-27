'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import ProductForm from './ProductForm'
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

interface ProductsListProps {
  products: Product[]
  categories: Category[]
  attributes: Attribute[]
  companyId: string
}

/* ---------------- COMPONENT ---------------- */

export default function ProductsList({
  products,
  categories,
  attributes,
  companyId,
}: ProductsListProps) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [localProducts, setLocalProducts] =
    useState<Product[]>(products)

  const [showForm, setShowForm] =
    useState<boolean>(false)

  const [editProduct, setEditProduct] =
    useState<Product | null>(null)

  async function toggleProduct(product: Product) {
    const newStatus = !product.is_active

    await supabase
      .from('products')
      .update({ is_active: newStatus })
      .eq('id', product.id)

    setLocalProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? { ...p, is_active: newStatus }
          : p
      )
    )
  }

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          Products
        </h1>

        <button
          onClick={() => {
            setEditProduct(null)
            setShowForm(true)
          }}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add Product
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="mb-8">
          <ProductForm
            product={editProduct}
            categories={categories}
            attributes={attributes}
            companyId={companyId}
            onClose={() => {
              setShowForm(false)
              setEditProduct(null)
            }}
          />
        </div>
      )}

      {/* TABLE */}
      <div className="border rounded bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="text-left">
              <th className="p-3 w-16">Img</th>
              <th className="p-3">Name</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-center">Variants</th>
              <th className="p-3 text-center">Images</th>
              <th className="p-3 text-center">Active</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {localProducts.map((p) => {
              const primaryImage =
                p.product_images?.find(
                  (img) => img.sort_order === 0
                )?.image_url

              const imageCount =
                p.product_images?.length || 0

              const variantCount =
                p.variants?.length || 0

              return (
                <tr
                  key={p.id}
                  className={`border-t hover:bg-gray-50 ${
                    !p.is_active ? 'opacity-50' : ''
                  }`}
                >
                  <td className="p-3">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                        No Img
                      </div>
                    )}
                  </td>

                  <td className="p-3 font-medium truncate max-w-[220px]">
                    {p.name}
                  </td>

                  <td className="p-3 text-right">
                    ₹ {p.base_price ?? '-'}
                  </td>

                  <td className="p-3 text-center">
                    {variantCount}
                  </td>

                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        imageCount === 4
                          ? 'bg-green-100 text-green-700'
                          : imageCount > 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {imageCount}/4
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleProduct(p)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        p.is_active
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          p.is_active
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>

                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setEditProduct(p)
                        setShowForm(true)
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </td>

                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}