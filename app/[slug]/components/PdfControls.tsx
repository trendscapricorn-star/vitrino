'use client'

import { useState } from 'react'

export default function PdfControls({
  products,
  attributes,
  slug
}: any) {

  const [selectedProducts, setSelectedProducts] = useState<any[]>([])
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
  const [pdfSort, setPdfSort] = useState('default')

  const [showModal, setShowModal] = useState(false)
  const [includeName, setIncludeName] = useState(true)
  const [includePrice, setIncludePrice] = useState(true)
  const [includeAttributes, setIncludeAttributes] = useState(false)

  const selectedIds = selectedProducts.map(p => p.id)

  function toggleSelect(product: any) {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id)
      if (exists) return prev.filter(p => p.id !== product.id)
      return [...prev, product]
    })
  }

  async function handleGeneratePDF(config: any) {

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
        config
      })
    })

    const blob = await res.blob()

    if (blob.size === 0) {
      alert('PDF generation failed')
      return
    }

    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'catalog.pdf'
    document.body.appendChild(a)
    a.click()
    a.remove()
  } // ✅ IMPORTANT: FUNCTION CLOSED HERE

  return (
    <div>

      {/* TOP BAR */}
      <div className="mb-4 space-y-3">

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

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {selectedProducts.length} selected
          </div>

          <button
            onClick={() => setShowModal(true)}
            disabled={selectedProducts.length === 0}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Generate PDF
          </button>
        </div>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-lg w-80 space-y-4">

            <div className="font-semibold text-lg">
              PDF Settings
            </div>

            <label className="flex gap-2">
              <input
                type="checkbox"
                checked={includeName}
                onChange={() => setIncludeName(!includeName)}
              />
              Show Name
            </label>

            <label className="flex gap-2">
              <input
                type="checkbox"
                checked={includePrice}
                onChange={() => setIncludePrice(!includePrice)}
              />
              Show Price
            </label>

            <label className="flex gap-2">
              <input
                type="checkbox"
                checked={includeAttributes}
                onChange={() => setIncludeAttributes(!includeAttributes)}
              />
              Show Attributes
            </label>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowModal(false)
                  handleGeneratePDF({
                    includeName,
                    includePrice,
                    includeAttributes
                  })
                }}
                className="bg-black text-white px-3 py-1 rounded"
              >
                Generate
              </button>
            </div>

          </div>

        </div>
      )}

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {products?.map((p:any)=>{

          const primaryImage =
            p.product_images?.find(
              (img:any)=>img.sort_order===0
            )?.image_url

          return (

            <div
              key={p.id}
              className={`relative bg-white border rounded-xl overflow-hidden ${
                selectedIds.includes(p.id) ? 'ring-2 ring-black' : ''
              }`}
            >

              <input
                type="checkbox"
                checked={selectedIds.includes(p.id)}
                onChange={() => toggleSelect(p)}
                className="absolute top-2 left-2 z-10"
              />

              <a href={`/${slug}/${p.slug}`}>

                <div className="h-64 flex items-center justify-center bg-gray-50">
                  {primaryImage && (
                    <img
                      src={primaryImage}
                      className="max-h-full object-contain"
                    />
                  )}
                </div>

                <div className="p-3">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-sm font-semibold">
                    ₹ {p.base_price ?? '-'}
                  </div>
                </div>

              </a>

            </div>

          )
        })}

      </div>

    </div>
  )
}