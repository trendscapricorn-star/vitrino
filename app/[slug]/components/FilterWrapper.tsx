'use client'

import { useState } from 'react'
import FilterSidebar from './FilterSidebar'

export default function FilterWrapper(props: any) {

  const [showFilters, setShowFilters] = useState(false)

  return (
    <>
      {/* MOBILE BUTTON */}
      <div className="mb-4 md:hidden">
        <button
          onClick={() => setShowFilters(true)}
          className="w-full border py-2 rounded-lg bg-white shadow-sm"
        >
          Filters
        </button>
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:block md:col-span-3">
        <FilterSidebar {...props} />
      </div>

      {/* MOBILE DRAWER */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/40 flex">

          <div className="w-4/5 max-w-sm bg-white h-full p-4 overflow-y-auto">

            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold text-lg">Filters</div>
              <button onClick={() => setShowFilters(false)}>✕</button>
            </div>

            <FilterSidebar {...props} />

          </div>

          <div
            className="flex-1"
            onClick={() => setShowFilters(false)}
          />

        </div>
      )}
    </>
  )
}