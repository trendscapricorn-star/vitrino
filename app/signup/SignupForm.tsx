"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"

export default function SignupForm() {
  const supabase = getSupabaseClient()
  const router = useRouter()

  const [role, setRole] = useState<"manufacturer" | "distributor">(
    "manufacturer"
  )

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [slug, setSlug] = useState("")
  const [phone, setPhone] = useState("")
  const [gstin, setGstin] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* 🔹 GST FETCH */
  async function fetchGSTDetails(gstin: string) {
    try {
      const res = await fetch(`/api/gst?gstin=${gstin}`)
      const data = await res.json()

      if (data?.legal_name) {
        setDisplayName(data.legal_name)
      }
    } catch (err) {
      console.error("GST fetch failed", err)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError(null)

    /* ---------- CREATE AUTH USER ---------- */

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

    /* ---------- MANUFACTURER ---------- */

    if (role === "manufacturer") {

      const { data: company, error: companyError } =
        await supabase
          .from("companies")
          .insert({
            auth_user_id: user.id,
            display_name: displayName.trim(),
            slug: slug.toLowerCase().trim(),
            email,
            gstin: gstin || null,
            subscription_status: "trial",
          })
          .select()
          .single()

      if (companyError || !company) {
        setError(companyError?.message || "Company creation failed")
        setLoading(false)
        return
      }

      await fetch("/api/create-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: company.id,
        }),
      })
    }

    /* ---------- DISTRIBUTOR ---------- */

    if (role === "distributor") {

      const { error: distributorError } =
        await supabase
          .from("distributors")
          .insert({
            auth_user_id: user.id,
            name: displayName,
            phone,
            gstin: gstin || null,
          })

      if (distributorError) {
        setError(distributorError.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSignup} className="space-y-4">

      {/* ROLE SELECTOR */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setRole("manufacturer")}
          className={`flex-1 border py-2 rounded ${
            role === "manufacturer" ? "bg-black text-white" : ""
          }`}
        >
          Manufacturer
        </button>

        <button
          type="button"
          onClick={() => setRole("distributor")}
          className={`flex-1 border py-2 rounded ${
            role === "distributor" ? "bg-black text-white" : ""
          }`}
        >
          Distributor
        </button>
      </div>

      {/* NAME */}
      <input
        type="text"
        placeholder={
          role === "manufacturer"
            ? "Company Name"
            : "Distributor Name"
        }
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />

      {/* ✅ GST FIELD (FOR BOTH) */}
      <input
        type="text"
        placeholder="GSTIN (optional)"
        value={gstin}
        onChange={(e) => setGstin(e.target.value.toUpperCase())}
        onBlur={() => {
          if (gstin.length === 15) {
            fetchGSTDetails(gstin)
          }
        }}
        className="w-full border px-3 py-2 rounded"
      />

      {/* SLUG (ONLY MANUFACTURER) */}
      {role === "manufacturer" && (
        <input
          type="text"
          placeholder="Company Slug"
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
      )}

      {/* PHONE (ONLY DISTRIBUTOR) */}
      {role === "distributor" && (
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      )}

      {/* EMAIL */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />

      {/* PASSWORD */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />

      {/* SUBMIT */}
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
  )
}