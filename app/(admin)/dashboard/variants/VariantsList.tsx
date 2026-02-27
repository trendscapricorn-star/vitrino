'use client'

import { useState } from 'react'
import VariantManager from './VariantManager'

/* ---------------- TYPES ---------------- */

type Product = {
  id: string
  name: string
}

interface VariantsListProps {
  products: Product[]
  companyId: string
}

/* ---------------- COMPONENT ---------------- */

export default function VariantsList({
  products,
  companyId,
}: VariantsListProps) {
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null)

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