"use client"

import { useState } from "react"
import { supabaseBrowser } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"

export default function SignupForm() {
  const supabase = supabaseBrowser
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [slug, setSlug] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSignup() {
    setLoading(true)
    setError("")

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const user = data.user
    if (!user) {
      setError("Signup failed")
      setLoading(false)
      return
    }

    // Create company
    const { data: company } = await supabase
      .from("companies")
      .insert({
        auth_user_id: user.id,
        display_name: slug,
        slug,
        email,
      })
      .select()
      .single()

    if (!company) {
      setError("Company creation failed")
      setLoading(false)
      return
    }

    // Create trial subscription
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 7)

    await supabase.from("subscriptions").insert({
      company_id: company.id,
      status: "trialing",
      trial_ends_at: trialEnd,
      created_at: new Date(),
      updated_at: new Date(),
    })

    setLoading(false)
    router.push("/dashboard")
  }

  return (
    <div className="space-y-4">
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border px-4 py-2 rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border px-4 py-2 rounded"
      />

      <input
        placeholder="Choose your slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="w-full border px-4 py-2 rounded"
      />

      <button
        onClick={handleSignup}
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>

      {error && (
        <div className="text-red-600 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  )
}