"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"

export default function SignupForm() {
  const supabase = getSupabaseClient()
  const router = useRouter()

  const [role, setRole] = useState<"manufacturer" | "distributor">("manufacturer")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [slug, setSlug] = useState("")
  const [phone, setPhone] = useState("")
  const [gstin, setGstin] = useState("")

  // 🔥 NEW FIELDS
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [gstLoading, setGstLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* 🔹 GST FETCH (WITH BUTTON) */
async function fetchGSTDetails() {
  if (gstin.length !== 15) return

  setGstLoading(true)

  try {
    const res = await fetch(`/api/gst?gstin=${gstin}`)
    const data = await res.json()

    const info = data?.taxpayerInfo

    if (info) {
      // ✅ BUSINESS NAME
      setDisplayName(info.tradeNam || info.lgnm || "")

      // ✅ ADDRESS
      const addr = info.pradr?.addr

      if (addr) {
        setAddress(
          `${addr.bno || ""} ${addr.st || ""}`.trim()
        )

        setCity(addr.dst || "")
        setState(addr.stcd || "")
      }
    }
  } catch (err) {
    console.error("GST fetch failed", err)
  }

  setGstLoading(false)
}

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError(null)

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
            address,
            city,
            state,
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
        body: JSON.stringify({ companyId: company.id }),
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
            address,
            city,
            state,
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

      {/* ROLE */}
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

      {/* GST + BUTTON */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter GSTIN"
          value={gstin}
          onChange={(e) => setGstin(e.target.value.toUpperCase())}
          className="w-full border px-3 py-2 rounded"
        />

        <button
          type="button"
          onClick={fetchGSTDetails}
          className="bg-black text-white px-4 rounded"
        >
          {gstLoading ? "..." : "Check"}
        </button>
      </div>

      {/* NAME */}
      <input
        type="text"
        placeholder="Business Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />

      {/* ADDRESS */}
      <input
        type="text"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      {/* CITY + STATE */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* SLUG */}
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

      {/* PHONE */}
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
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

    </form>
  )
}