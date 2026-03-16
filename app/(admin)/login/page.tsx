'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    /* ---------- LOGIN ---------- */

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      setError(error?.message || 'Login failed')
      setLoading(false)
      return
    }

    const userId = data.user.id

    /* ---------- CHECK MANUFACTURER ---------- */

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('auth_user_id', userId)
      .maybeSingle()

    if (company) {
      setLoading(false)
      router.push('/dashboard')
      return
    }

    /* ---------- CHECK DISTRIBUTOR ---------- */

    const { data: distributor } = await supabase
      .from('distributors')
      .select('id')
      .eq('auth_user_id', userId)
      .maybeSingle()

    if (distributor) {
      setLoading(false)
      router.push('/distributor')
      return
    }

    /* ---------- FALLBACK ---------- */

    setLoading(false)
    router.push('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">

      <form
        onSubmit={handleLogin}
        className="w-80 space-y-4 bg-white p-6 rounded-xl shadow"
      >

        {/* Back Button */}

        <button
          type="button"
          onClick={() => router.push('/')}
          className="text-sm text-gray-500 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}

        {/* Create Account */}

        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/signup')}
            className="text-black font-medium hover:underline"
          >
            Create Account
          </button>
        </p>

      </form>

    </div>
  )
}