"use client"

import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase-browser"

export default function PricingPage() {

  const supabase = supabaseBrowser

  const [loading, setLoading] = useState<string | null>(null)
  const [companyId, setCompanyId] = useState<string>("")

  useEffect(() => {
    loadCompany()
  }, [])

  async function loadCompany() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("companies")
      .select("id")
      .eq("auth_user_id", user.id)
      .single()

    if (data) {
      setCompanyId(data.id)
    }
  }

  /* 🔁 SUBSCRIPTION */
  const handleSubscribe = async (planType: string) => {
    try {
      setLoading("sub_" + planType)

      const res = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType, companyId }),
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
        description: planType + " subscription",
        theme: { color: "#000000" },
        handler: function () {
          window.location.href = "/dashboard/settings"
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

  /* 💳 ONE-TIME PAYMENT */
  const handlePayOnce = async (planType: string) => {
    try {
      setLoading("one_" + planType)

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      })

      const data = await res.json()

      if (!data.orderId) {
        alert("Payment failed")
        return
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "Vitrino",
        description: planType + " plan",
        order_id: data.orderId,

        handler: async function () {

          await fetch("/api/confirm-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyId,
              planType
            })
          })

          alert("Payment successful")
          window.location.href = "/dashboard/settings"
        }
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

      {/* MONTHLY */}
      <div className="space-y-2 w-64">
        <button
          onClick={() => handleSubscribe("monthly")}
          disabled={loading !== null}
          className="px-6 py-3 bg-black text-white rounded-lg w-full"
        >
          {loading === "sub_monthly" ? "Processing..." : "Subscribe Monthly ₹399"}
        </button>

        <button
          onClick={() => handlePayOnce("monthly")}
          disabled={loading !== null}
          className="px-6 py-3 bg-gray-200 text-black rounded-lg w-full"
        >
          {loading === "one_monthly" ? "Processing..." : "Pay Once ₹399"}
        </button>
      </div>

      {/* QUARTERLY */}
      <div className="space-y-2 w-64">
        <button
          onClick={() => handleSubscribe("quarterly")}
          disabled={loading !== null}
          className="px-6 py-3 bg-black text-white rounded-lg w-full"
        >
          {loading === "sub_quarterly" ? "Processing..." : "Subscribe Quarterly ₹1099"}
        </button>

        <button
          onClick={() => handlePayOnce("quarterly")}
          disabled={loading !== null}
          className="px-6 py-3 bg-gray-200 text-black rounded-lg w-full"
        >
          {loading === "one_quarterly" ? "Processing..." : "Pay Once ₹1099"}
        </button>
      </div>

      {/* YEARLY */}
      <div className="space-y-2 w-64">
        <button
          onClick={() => handleSubscribe("yearly")}
          disabled={loading !== null}
          className="px-6 py-3 bg-black text-white rounded-lg w-full"
        >
          {loading === "sub_yearly" ? "Processing..." : "Subscribe Yearly ₹3999"}
        </button>

        <button
          onClick={() => handlePayOnce("yearly")}
          disabled={loading !== null}
          className="px-6 py-3 bg-gray-200 text-black rounded-lg w-full"
        >
          {loading === "one_yearly" ? "Processing..." : "Pay Once ₹3999"}
        </button>
      </div>

    </div>
  )
}