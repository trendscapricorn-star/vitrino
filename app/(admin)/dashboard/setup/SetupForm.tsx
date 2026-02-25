'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function SetupForm() {
  const router = useRouter()
  const supabase = getSupabaseClient()

  const [displayName, setDisplayName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('companies').insert({
      auth_user_id: user.id,
      display_name: displayName,
      slug: slug.toLowerCase(),
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-96 space-y-4">
        <h1 className="text-2xl font-bold">Setup Company</h1>

        <input
          type="text"
          placeholder="Company Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full border p-2"
          required
        />

        <input
          type="text"
          placeholder="Slug (unique name)"
          value={slug}
          onChange={(e) =>
            setSlug(e.target.value.replace(/\s+/g, '-'))
          }
          className="w-full border p-2"
          required
        />

        <button
          type="submit"
          className="w-full bg-black text-white p-2"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Company'}
        </button>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </form>
    </div>
  )
}