'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'

type Company = {
  id: string
  display_name: string
  slug: string
}

type Connection = {
  id: string
  status: string
  company: Company
}

export default function CompaniesPage() {
  const supabase = getSupabaseClient()
  const router = useRouter()

  const [connections, setConnections] = useState<Connection[]>([])
  const [distributorId, setDistributorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: distributor } = await supabase
      .from('distributors')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!distributor) return

    setDistributorId(distributor.id)

    const { data } = await supabase
      .from('distributor_company_access')
      .select(`
        id,
        status,
        company:companies (
          id,
          display_name,
          slug
        )
      `)
      .eq('distributor_id', distributor.id)

    setConnections(data || [])
    setLoading(false)
  }

  /* ---------- ACCEPT ---------- */

  async function acceptInvite(companyId: string) {
    if (!distributorId) return

    await supabase
      .from('distributor_company_access')
      .update({ status: 'approved' })
      .eq('company_id', companyId)
      .eq('distributor_id', distributorId)

    loadData()
  }

  /* ---------- REJECT ---------- */

  async function rejectInvite(companyId: string) {
    if (!distributorId) return

    await supabase
      .from('distributor_company_access')
      .update({ status: 'rejected' })
      .eq('company_id', companyId)
      .eq('distributor_id', distributorId)

    loadData()
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-semibold">
        My Manufacturers
      </h1>

      {/* 🔥 INVITES */}

      <div>
        <h2 className="text-lg font-medium mb-4">
          Invitations
        </h2>

        {connections.filter(c => c.status === 'invited').length === 0 && (
          <p className="text-sm text-gray-500">
            No invites
          </p>
        )}

        <div className="space-y-3">

          {connections
            .filter(c => c.status === 'invited')
            .map((c) => (
              <div
                key={c.id}
                className="bg-white border rounded-xl p-4 flex justify-between items-center"
              >

                <div>
                  <p className="font-medium">
                    {c.company?.display_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    /{c.company?.slug}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => acceptInvite(c.company.id)}
                    className="bg-black text-white px-3 py-1 rounded"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => rejectInvite(c.company.id)}
                    className="border px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>

              </div>
            ))}

        </div>
      </div>

      {/* 🟢 CONNECTED */}

      <div>
        <h2 className="text-lg font-medium mb-4">
          Connected
        </h2>

        {connections.filter(c => c.status === 'approved').length === 0 && (
          <p className="text-sm text-gray-500">
            No connected manufacturers
          </p>
        )}

        <div className="space-y-3">

          {connections
            .filter(c => c.status === 'approved')
            .map((c) => (
              <div
                key={c.id}
                className="bg-white border rounded-xl p-4 flex justify-between items-center"
              >

                <div>
                  <p className="font-medium">
                    {c.company?.display_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    /{c.company?.slug}
                  </p>
                </div>

                <button
                  onClick={() => router.push(`/${c.company.slug}`)}
                  className="border px-3 py-1 rounded"
                >
                  View
                </button>

              </div>
            ))}

        </div>
      </div>

    </div>
  )
}