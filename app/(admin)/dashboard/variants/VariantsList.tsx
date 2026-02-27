'use client'

import { useState } from 'react'
import VariantManager from './VariantManager'

export default function VariantsList({
  products,
  companyId,
}) {
  const [selectedProduct, setSelectedProduct] = useState(null)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Variant Products
      </h1>

      {selectedProduct ? (
        <VariantManager
          product={selectedProduct}
          companyId={companyId}
          onBack={() => setSelectedProduct(null)}
        />
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="border p-4 rounded flex justify-between"
            >
              <div>
                <div className="font-medium">
                  {p.name}
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedProduct(p)
                }
                className="text-blue-600 text-sm"
              >
                Manage Variants
              </button>
            </div>
          ))}

          {products.length === 0 && (
            <div className="text-gray-500">
              No products with variants.
            </div>
          )}
        </div>
      )}
    </div>
  )
}