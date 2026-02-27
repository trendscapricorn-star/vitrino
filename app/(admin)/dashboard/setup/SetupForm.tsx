'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function SetupForm() {
  const router = useRouter()
  const supabase = getSupabaseClient()

  const [displayName, setDisplayName] = useState<string>('')
  const [slug, setSlug] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('companies')
      .insert({
        auth_user_id: user.id,
        display_name: displayName.trim(),
        slug: slug.toLowerCase().trim(),
      })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <form
        onSubmit={handleSubmit}
        className="w-96 space-y-5 bg-white p-8 rounded-xl shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-center">
          Setup Your Company
        </h1>

        {/* Company Name */}
        <input
          type="text"
          placeholder="Company Name"
          value={displayName}
          onChange={(e) =>
            setDisplayName(e.target.value)
          }
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
          required
        />

        {/* Slug */}
        <div>
          <input
            type="text"
            placeholder="Slug (unique name)"
            value={slug}
            onChange={(e) =>
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^a-z0-9-]/g, '')
              )
            }
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
            required
          />

          {slug && (
            <p className="text-xs text-gray-500 mt-1">
              Your public page: {window?.location?.origin}/{slug}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:opacity-90 transition"
        >
          {loading ? 'Creating...' : 'Create Company'}
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