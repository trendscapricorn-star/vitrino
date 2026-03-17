'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

type Request = {
  id: string
  status: string
  distributors: {
    id: string
    name: string
    phone: string | null
  }
}

export default function DistributorApprovalPage() {
  const supabase = supabaseBrowser

  const [companyId, setCompanyId] = useState<string | null>(null)
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    setLoading(true)

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

    setCompanyId(company.id)

    /* ---------- FETCH REQUESTS ---------- */

    const { data } = await supabase
      .from('distributor_company_access')
      .select(`
        id,
        status,
        distributors (
          id,
          name,
          phone
        )
      `)
      .eq('company_id', company.id)
      .order('requested_at', { ascending: false })

    setRequests(data || [])
    setLoading(false)
  }

  /* ---------- APPROVE ---------- */

  async function approve(id: string) {
    await supabase
      .from('distributor_company_access')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)

    loadRequests()
  }

  /* ---------- REJECT ---------- */

  async function reject(id: string) {
    await supabase
      .from('distributor_company_access')
      .update({
        status: 'rejected',
      })
      .eq('id', id)

    loadRequests()
  }

  /* ---------- FILTER ---------- */

  const pending = requests.filter(r => r.status === 'pending')
  const approved = requests.filter(r => r.status === 'approved')

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-semibold">
        Distributors
      </h1>

      {loading && <p>Loading...</p>}

      {/* 🔶 Pending Requests */}

      <div>
        <h2 className="text-lg font-medium mb-4">
          Pending Requests
        </h2>

        {pending.length === 0 && (
          <p className="text-sm text-gray-500">
            No pending requests
          </p>
        )}

        <div className="space-y-3">

          {pending.map((req) => (
            <div
              key={req.id}
              className="bg-white border rounded-xl p-4 flex justify-between items-center"
            >

              <div>
                <p className="font-medium">
                  {req.distributors?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {req.distributors?.phone || 'No phone'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => approve(req.id)}
                  className="bg-black text-white px-3 py-1 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => reject(req.id)}
                  className="border px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>

            </div>
          ))}

        </div>
      </div>

      {/* 🟢 Approved */}

      <div>
        <h2 className="text-lg font-medium mb-4">
          Connected Distributors
        </h2>

        {approved.length === 0 && (
          <p className="text-sm text-gray-500">
            No distributors yet
          </p>
        )}

        <div className="space-y-3">

          {approved.map((req) => (
            <div
              key={req.id}
              className="bg-white border rounded-xl p-4 flex justify-between items-center"
            >

              <div>
                <p className="font-medium">
                  {req.distributors?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {req.distributors?.phone || 'No phone'}
                </p>
              </div>

              <span className="text-green-600 text-sm">
                Connected
              </span>

            </div>
          ))}

        </div>
      </div>

    </div>
  )
}