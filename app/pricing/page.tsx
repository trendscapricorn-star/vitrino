"use client"

import { useState } from "react"

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planType: string) => {
    try {
      setLoading(planType)

      const res = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      })

      const data = await res.json()

      if (!data.subscriptionId) {
        alert("Subscription creation failed")
        return
      }

      const options = {
        key: data.key,
        subscription_id: data.subscriptionId,
        name: "Vitrino",
        description: "Vitrino Subscription",
        theme: { color: "#000000" },
        handler: function () {
          window.location.href = "/dashboard"
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()

    } catch (error) {
      console.error(error)
      alert("Something went wrong")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">

      <h1 className="text-3xl font-bold">Choose Your Plan</h1>

      <button
        onClick={() => handleSubscribe("monthly")}
        disabled={loading !== null}
        className="px-6 py-3 bg-black text-white rounded-lg"
      >
        {loading === "monthly" ? "Processing..." : "Upgrade Monthly ₹399"}
      </button>

      <button
        onClick={() => handleSubscribe("quarterly")}
        disabled={loading !== null}
        className="px-6 py-3 bg-black text-white rounded-lg"
      >
        {loading === "quarterly" ? "Processing..." : "Upgrade Quarterly ₹1099"}
      </button>

      <button
        onClick={() => handleSubscribe("yearly")}
        disabled={loading !== null}
        className="px-6 py-3 bg-black text-white rounded-lg"
      >
        {loading === "yearly" ? "Processing..." : "Upgrade Yearly ₹3999"}
      </button>

    </div>
  )
}