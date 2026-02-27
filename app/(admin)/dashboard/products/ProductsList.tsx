'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import ProductForm from './ProductForm'

export default function ProductsList({
  products,
  categories,
  attributes,
  companyId,
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ✅ Local state for instant UI update
  const [localProducts, setLocalProducts] = useState(products)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)

  // ✅ Toggle without reload
  async function toggleProduct(product: any) {
    const newStatus = !product.is_active

    await supabase
      .from('products')
      .update({ is_active: newStatus })
      .eq('id', product.id)

    setLocalProducts((prev: any[]) =>
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
        <h1 className="text-2xl font-semibold">Products</h1>

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

      {/* ADD / EDIT FORM */}
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

      {/* PRODUCT TABLE */}
      <div className="border rounded bg-white overflow-hidden">

        <table className="w-full text-sm">

          {/* HEADER */}
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

          {/* BODY */}
          <tbody>
            {localProducts.map((p: any) => {

              const primaryImage =
                p.product_images?.find(
                  (img: any) => img.sort_order === 0
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
                  {/* THUMBNAIL */}
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

                  {/* NAME */}
                  <td className="p-3 font-medium truncate max-w-[220px]">
                    {p.name}
                  </td>

                  {/* PRICE */}
                  <td className="p-3 text-right">
                    ₹ {p.base_price ?? '-'}
                  </td>

                  {/* VARIANTS */}
                  <td className="p-3 text-center">
                    {variantCount}
                  </td>

                  {/* IMAGE COUNT */}
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

                  {/* ACTIVE TOGGLE SWITCH */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleProduct(p)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        p.is_active ? 'bg-green-500' : 'bg-gray-300'
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

                  {/* ACTIONS */}
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