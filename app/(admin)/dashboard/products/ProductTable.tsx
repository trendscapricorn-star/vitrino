'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function ProductTable({ products }) {
  return (
    <div className="border rounded bg-white overflow-hidden">

      <table className="w-full text-sm">

        {/* HEADER */}
        <thead className="bg-gray-50 text-gray-600">
          <tr className="text-left">
            <th className="p-3 w-16">Img</th>
            <th className="p-3">Name</th>
            <th className="p-3">Category</th>
            <th className="p-3 text-right">Price</th>
            <th className="p-3 text-center">Variants</th>
            <th className="p-3 text-center">Images</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {products.map((product) => {

            const primaryImage =
              product.product_images?.find(
                (img) => img.sort_order === 0
              )?.image_url

            const imageCount =
              product.product_images?.length || 0

            const variantCount =
              product.variants?.length || 0

            return (
              <tr
                key={product.id}
                className="border-t hover:bg-gray-50"
              >
                {/* THUMBNAIL */}
                <td className="p-3">
                  {primaryImage ? (
                    <div className="w-12 h-12 relative">
                      <Image
                        src={primaryImage}
                        alt="Product"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                      No Img
                    </div>
                  )}
                </td>

                {/* NAME */}
                <td className="p-3 font-medium truncate max-w-[200px]">
                  {product.name}
                </td>

                {/* CATEGORY */}
                <td className="p-3 text-gray-600">
                  {product.category?.name}
                </td>

                {/* PRICE */}
                <td className="p-3 text-right">
                  ₹{product.base_price || 0}
                </td>

                {/* VARIANT COUNT */}
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

                {/* ACTIONS */}
                <td className="p-3 text-right">
                  <Link
                    href={`/dashboard/products/${product.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>

              </tr>
            )
          })}
        </tbody>
      </table>

    </div>
  )
}