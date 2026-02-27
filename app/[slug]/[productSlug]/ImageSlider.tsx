'use client'

import { useEffect, useState } from 'react'

export default function ImageSlider({
  images,
}: {
  images: string[]
}) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setCurrent((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [images])

  if (images.length === 0) {
    return (
      <div className="h-96 bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg">
        No Images
      </div>
    )
  }

  return (
    <div className="relative">

      {/* Main Image */}
      <img
        src={images[current]}
        className="w-full h-[500px] object-contain bg-white border rounded-lg"
      />

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                current === i
                  ? 'bg-black'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}