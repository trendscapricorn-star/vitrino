'use client'

import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'

type Distributor = {
  id: string
  name: string
  business_tags_text?: string
  city?: string
}

export default function DiscoverDistributorsPage() {
  const supabase = getSupabaseClient()

  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Distributor[]>([])
  const [loading, setLoading] = useState(false)
  const [invitingId, setInvitingId] = useState<string | null>(null)

  /* ---------- SEARCH ---------- */

  async function searchDistributors() {
    if (!search.trim()) return

    setLoading(true)

    try {
      /* ---------- AI PARSE ---------- */

      const aiRes = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'search_parse',
          query: search,
        }),
      })

      const ai = await aiRes.json()

      /* ---------- DB SEARCH ---------- */

      const { data } = await supabase.rpc('search_distributors', {
        search_text: ai.search || search,
        tags: ai.tags || null,
        city: ai.city || null,
      })

      setResults(data || [])

    } catch (err) {
      console.error(err)
      setResults([])
    }

    setLoading(false)
  }

  /* ---------- INVITE DISTRIBUTOR ---------- */

  async function inviteDistributor(distributorId: string) {
    try {
      setInvitingId(distributorId)

      /* ---------- GET USER ---------- */

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      /* ---------- GET COMPANY ---------- */

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!company) return

      /* ---------- CHECK DUPLICATE ---------- */

      const { data: existing } = await supabase
        .from('distributor_company_access')
        .select('id')
        .eq('distributor_id', distributorId)
        .eq('company_id', company.id)
        .maybeSingle()

      if (existing) {
        alert('Already invited or connected')
        return
      }

      /* ---------- INSERT INVITE ---------- */

      const { error } = await supabase
        .from('distributor_company_access')
        .insert({
          distributor_id: distributorId,
          company_id: company.id,
          status: 'invited',
        })

      if (error) {
        alert(error.message)
      } else {
        alert('Invitation sent')
      }

    } catch (err) {
      console.error(err)
      alert('Something went wrong')
    } finally {
      setInvitingId(null)
    }
  }

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-semibold">
        Discover Distributors
      </h1>

      {/* SEARCH */}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search distributors (e.g. womens wear delhi)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border px-3 py-2 rounded"
        />

        <button
          onClick={searchDistributors}
          className="bg-black text-white px-4 rounded"
        >
          Search
        </button>
      </div>

      {/* RESULTS */}

      {loading && <p>Searching...</p>}

      {!loading && search && (
        <p className="text-sm text-zinc-500">
          Showing results for "{search}"
        </p>
      )}

      <div className="space-y-3">

        {results.map((d) => (
          <div
            key={d.id}
            className="bg-white border p-4 rounded-xl flex justify-between items-center"
          >

            {/* INFO */}

            <div>
              <p className="font-medium">{d.name}</p>

              {d.city && (
                <p className="text-xs text-zinc-400">
                  📍 {d.city}
                </p>
              )}

              {d.business_tags_text && (
                <p className="text-xs text-zinc-400">
                  {d.business_tags_text}
                </p>
              )}
            </div>

            {/* ACTION */}

            <button
              onClick={() => inviteDistributor(d.id)}
              disabled={invitingId === d.id}
              className="bg-black text-white px-3 py-1 rounded disabled:opacity-50"
            >
              {invitingId === d.id ? 'Sending...' : 'Invite'}
            </button>

          </div>
        ))}

      </div>

    </div>
  )
}