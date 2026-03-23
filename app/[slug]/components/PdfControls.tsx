'use client'

import { useState } from 'react'

export default function PdfControls({
  products,
  attributes
}: any) {

  const [selectedProducts, setSelectedProducts] = useState<any[]>([])
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
  const [pdfSort, setPdfSort] = useState('default')

  const selectedIds = selectedProducts.map(p => p.id)

  function toggleSelect(product: any) {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id)
      if (exists) return prev.filter(p => p.id !== product.id)
      return [...prev, product]
    })
  }

  async function handleGeneratePDF() {

    if (selectedProducts.length === 0) return

    let sorted = [...selectedProducts]

    if (pdfSort === 'price_asc') {
      sorted.sort((a,b)=> (a.base_price||0)-(b.base_price||0))
    } else if (pdfSort === 'price_desc') {
      sorted.sort((a,b)=> (b.base_price||0)-(a.base_price||0))
    } else if (pdfSort === 'name') {
      sorted.sort((a,b)=> a.name.localeCompare(b.name))
    }

    const res = await fetch('/api/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        products: sorted,
        attributes: selectedAttributes
      })
    })

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'catalog.pdf'
    a.click()
  }

  return (

    <div className="mb-4 space-y-3">

      {/* SETTINGS */}
      <div className="flex flex-wrap gap-3 items-center">

        <select
          multiple
          value={selectedAttributes}
          onChange={(e) =>
            setSelectedAttributes(
              Array.from(e.target.selectedOptions, o => o.value)
            )
          }
          className="border px-2 py-1 rounded text-sm"
        >
          {attributes?.map((a:any) => (
            <option key={a.id} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          value={pdfSort}
          onChange={(e) => setPdfSort(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="default">Default</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="name">Name</option>
        </select>

      </div>

      {/* BUTTON */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {selectedProducts.length} selected
        </div>

        <button
          onClick={handleGeneratePDF}
          disabled={selectedProducts.length === 0}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Generate PDF
        </button>
      </div>

      {/* PRODUCT GRID WITH CHECKBOX */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {products?.map((p:any)=>{

          const primaryImage =
            p.product_images?.find(
              (img:any)=>img.sort_order===0
            )?.image_url

          return (

            <div
              key={p.id}
              className="relative bg-white border rounded-xl p-2"
            >

              {/* CHECKBOX */}
              <input
                type="checkbox"
                checked={selectedIds.includes(p.id)}
                onChange={() => toggleSelect(p)}
                className="absolute top-2 left-2 z-10"
              />

              {/* IMAGE */}
              <div className="h-48 flex items-center justify-center bg-gray-50">
                {primaryImage && (
                  <img
                    src={primaryImage}
                    className="max-h-full object-contain"
                  />
                )}
              </div>

              {/* TEXT */}
              <div className="text-sm mt-2">{p.name}</div>
              <div className="font-semibold text-sm">
                ₹ {p.base_price ?? '-'}
              </div>

            </div>

          )
        })}

      </div>

    </div>
  )
}