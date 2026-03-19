'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'

type Company = {
  id: string
  display_name: string
  slug: string
  business_tags_text?: string
  city?: string
  score?: number
}

export default function DiscoverPage() {
  const supabase = getSupabaseClient()
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [connections, setConnections] = useState<any[]>([])
  const [distributorId, setDistributorId] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)

  /* ---------- LOAD DISTRIBUTOR ---------- */

  useEffect(() => {
    async function loadDistributor() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('distributors')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (data) {
        setDistributorId(data.id)

        const { data: conn } = await supabase
          .from('distributor_company_access')
          .select('*')
          .eq('distributor_id', data.id)

        setConnections(conn || [])
      }
    }

    loadDistributor()
  }, [supabase, router])

  /* ---------- 🔥 NEW FUZZY SEARCH ---------- */

async function searchCompanies() {
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

    const finalSearch = ai.search || search

    /* ---------- DB SEARCH ---------- */

    const { data } = await supabase.rpc('search_companies', {
      search_text: finalSearch,
    })

    setCompanies(data || [])

  } catch (err) {
    console.error(err)
    setCompanies([])
  }

  setLoading(false)
}

  /* ---------- REQUEST ACCESS ---------- */

  async function requestAccess(companyId: string) {
    if (!distributorId) return

    await supabase.from('distributor_company_access').insert({
      distributor_id: distributorId,
      company_id: companyId,
      status: 'pending',
    })

    const { data: conn } = await supabase
      .from('distributor_company_access')
      .select('*')
      .eq('distributor_id', distributorId)

    setConnections(conn || [])
  }

  /* ---------- GET STATUS ---------- */

  function getStatus(companyId: string) {
    const conn = connections.find(c => c.company_id === companyId)

    if (!conn) return 'none'
    return conn.status
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">

      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER */}

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            Discover Manufacturers
          </h1>

          <button
            onClick={() => router.push('/distributor')}
            className="text-sm text-zinc-500 hover:underline"
          >
            ← Back
          </button>
        </div>

        {/* SEARCH */}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search manufacturers (e.g. denim, kurti...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border px-3 py-2 rounded"
          />

          <button
            onClick={searchCompanies}
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

          {companies.map((company) => {
            const status = getStatus(company.id)

            return (
              <div
                key={company.id}
                className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
              >

                {/* INFO */}

                <div>
                  <p className="font-medium">
                    {company.display_name}
                  </p>

                  <p className="text-sm text-zinc-500">
                    /{company.slug}
                  </p>

                  {/* 🔥 Extra info (NEW) */}
                  {company.city && (
                    <p className="text-xs text-zinc-400">
                      📍 {company.city}
                    </p>
                  )}

                  {company.business_tags_text && (
                    <p className="text-xs text-zinc-400">
                      {company.business_tags_text}
                    </p>
                  )}
                </div>

                {/* ACTION */}

                {status === 'none' && (
                  <button
                    onClick={() => requestAccess(company.id)}
                    className="bg-black text-white px-3 py-1 rounded"
                  >
                    Request Access
                  </button>
                )}

                {status === 'pending' && (
                  <span className="text-sm text-yellow-600">
                    Pending
                  </span>
                )}

                {status === 'approved' && (
                  <button
                    onClick={() => router.push(`/${company.slug}`)}
                    className="border px-3 py-1 rounded"
                  >
                    View
                  </button>
                )}

              </div>
            )
          })}

        </div>

      </div>

    </div>
  )
}