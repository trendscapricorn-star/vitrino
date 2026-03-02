"use client"

import { useState } from "react"
import { supabaseBrowser } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"

export default function SignupForm() {
  const router = useRouter()
  const supabase = supabaseBrowser

  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [slug, setSlug] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"form" | "otp">("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /* 🔹 Send OTP */
  async function handleSendOtp() {
    setError("")
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setStep("otp")
  }

  /* 🔹 Verify OTP */
  async function handleVerifyOtp() {
    setError("")
    setLoading(true)

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const user = data.user
    if (!user) {
      setError("Authentication failed")
      setLoading(false)
      return
    }

    /* 🔹 Create Company */
    const { error: companyError } = await supabase
      .from("companies")
      .insert({
        auth_user_id: user.id,
        display_name: slug,
        slug,
        phone,
        email,
      })

    if (companyError) {
      setError(companyError.message)
      setLoading(false)
      return
    }

    /* 🔹 Create Trial Subscription */
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 7)

    await supabase.from("subscriptions").insert({
      company_id: user.id,
      status: "trialing",
      trial_ends_at: trialEnd,
      created_at: new Date(),
      updated_at: new Date(),
    })

    setLoading(false)

    router.push("/dashboard")
  }

  /* 🔹 UI */
  return (
    <div className="space-y-4">

      {step === "form" && (
        <>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />

          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />

          <input
            placeholder="Password (optional for now)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />

          <input
            placeholder="Choose your slug (yourbrand)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />

          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </>
      )}

      {step === "otp" && (
        <>
          <input
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border px-4 py-2 rounded text-center tracking-widest"
          />

          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </>
      )}

      {error && (
        <div className="text-red-600 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  )
}