"use client"

import { useEffect } from "react"

export default function ProductTracker({
  companyId,
  productId
}: {
  companyId: string
  productId: string
}) {

  useEffect(() => {

    const visitor = localStorage.getItem("vitrino_visitor")

    if (!visitor) return

    const { mobile } = JSON.parse(visitor)

    fetch("/api/catalog/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        companyId,
        productId,
        eventType: "view_product",
        visitorId: mobile
      })
    })

  }, [companyId, productId])

  return null
}