"use client"

import { useEffect, useState } from "react"

export default function VisitorGate({
  companyId,
  children
}: {
  companyId: string
  children: React.ReactNode
}) {

  const [allowed, setAllowed] = useState(false)
  const [name, setName] = useState("")
  const [mobile, setMobile] = useState("")

  useEffect(() => {

    const stored = localStorage.getItem("vitrino_visitor")

    if (stored) {
      setAllowed(true)
    }

  }, [])

  async function submit() {

    if (!mobile) return alert("Enter mobile number")

    const res = await fetch("/api/catalog/visitor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        companyId,
        name,
        mobile
      })
    })

    const data = await res.json()

    if (data.success) {

      localStorage.setItem(
        "vitrino_visitor",
        JSON.stringify({
          name,
          mobile
        })
      )

      setAllowed(true)
    }
  }

  if (allowed) {
    return <>{children}</>
  }

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-8 w-full max-w-sm">

        <h2 className="text-lg font-semibold mb-4">
          View Catalog
        </h2>

        <input
          placeholder="Name"
          className="border w-full p-2 mb-3 rounded"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <input
          placeholder="Mobile Number"
          className="border w-full p-2 mb-4 rounded"
          value={mobile}
          onChange={(e)=>setMobile(e.target.value)}
        />

        <button
          onClick={submit}
          className="bg-black text-white w-full py-2 rounded"
        >
          Continue
        </button>

      </div>

    </div>
  )
}