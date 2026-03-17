'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'

type Company = {
  id: string
  display_name: string
  slug: string
  logo_url: string | null
}

export default function DistributorCompaniesPage() {
  const supabase = getSupabaseClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<Company[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCompanies() {
      setLoading(true)
      setError(null)

      /* ---------- GET USER ---------- */

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      /* ---------- GET DISTRIBUTOR ---------- */

      const { data: distributor } = await supabase
        .from('distributors')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (!distributor) {
        setError('Distributor not found')
        setLoading(false)
        return
      }

      /* ---------- FETCH APPROVED COMPANIES ---------- */

      const { data, error } = await supabase
        .from('distributor_company_access')
        .select(`
          company_id,
          companies (
            id,
            display_name,
            slug,
            logo_url
          )
        `)
        .eq('distributor_id', distributor.id)
        .eq('status', 'approved')

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      const formatted =
        data?.map((item: any) => item.companies).filter(Boolean) || []

      setCompanies(formatted)
      setLoading(false)
    }

    loadCompanies()
  }, [supabase, router])

  return (
    <div className="min-h-screen bg-zinc-50 p-6">

      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER */}

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            My Manufacturers
          </h1>

          <button
            onClick={() => router.push('/distributor')}
            className="text-sm text-zinc-500 hover:underline"
          >
            ← Back
          </button>
        </div>

        {/* LOADING */}

        {loading && (
          <p className="text-zinc-500">Loading...</p>
        )}

        {/* ERROR */}

        {error && (
          <p className="text-red-500">{error}</p>
        )}

        {/* EMPTY STATE */}

        {!loading && companies.length === 0 && (
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-zinc-600 mb-4">
              No manufacturers connected yet
            </p>

            <button
              onClick={() => router.push('/distributor/discover')}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Discover Manufacturers
            </button>
          </div>
        )}

        {/* COMPANY LIST */}

        <div className="grid grid-cols-1 gap-4">

          {companies.map((company) => (
            <div
              key={company.id}
              onClick={() => router.push(`/${company.slug}`)}
              className="bg-white p-4 rounded-xl shadow flex items-center gap-4 cursor-pointer hover:shadow-md"
            >

              {/* LOGO */}

              <div className="w-12 h-12 bg-zinc-200 rounded-full overflow-hidden flex items-center justify-center">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-zinc-500">
                    Logo
                  </span>
                )}
              </div>

              {/* INFO */}

              <div>
                <p className="font-medium">
                  {company.display_name}
                </p>
                <p className="text-sm text-zinc-500">
                  /{company.slug}
                </p>
              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  )
}