"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"

export default function SignupForm() {
  const supabase = getSupabaseClient()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [slug, setSlug] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    /* ---------------- CREATE USER ---------------- */

    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email,
        password,
      })

    if (authError || !authData.user) {
      setError(authError?.message || "Signup failed")
      setLoading(false)
      return
    }

    const user = authData.user

    /* ---------------- CREATE COMPANY ---------------- */

    const { data: company, error: companyError } =
      await supabase
        .from("companies")
        .insert({
          auth_user_id: user.id,
          display_name: displayName.trim(),
          slug: slug.toLowerCase().trim(),
          email,
          subscription_status: "trial",
        })
        .select()
        .single()

    if (companyError || !company) {
      setError(companyError?.message || "Company creation failed")
      setLoading(false)
      return
    }

    /* ---------------- CREATE TRIAL SUBSCRIPTION ---------------- */

    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 7)

    await supabase.from("subscriptions").insert({
      company_id: company.id,
      plan_type: "trial",
      status: "trialing",
      trial_ends_at: trialEnd,
      created_at: new Date(),
      updated_at: new Date(),
    })

    setLoading(false)

    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <form
        onSubmit={handleSignup}
        className="w-96 space-y-4 bg-white p-8 rounded-xl shadow"
      >
        <h1 className="text-2xl font-semibold text-center">
          Create Account
        </h1>

        <input
          type="text"
          placeholder="Company Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Slug"
          value={slug}
          onChange={(e) =>
            setSlug(
              e.target.value
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")
            )
          }
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}
      </form>
    </div>
  )
}