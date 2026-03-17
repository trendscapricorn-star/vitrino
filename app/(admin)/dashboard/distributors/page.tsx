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

  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    setLoading(true)
    setError(null)

    try {
      /* ---------- GET USER ---------- */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError('User not found')
        setLoading(false)
        return
      }

      /* ---------- GET COMPANY ---------- */

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (companyError || !company) {
        setError('Company not found')
        setLoading(false)
        return
      }

      /* ---------- FETCH REQUESTS ---------- */

      const { data, error: requestError } = await supabase
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

      if (requestError) {
        setError(requestError.message)
        setLoading(false)
        return
      }

      setRequests(data || [])
      setLoading(false)

    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
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

    // Optimistic update
    setRequests(prev =>
      prev.map(r =>
        r.id === id ? { ...r, status: 'approved' } : r
      )
    )
  }

  /* ---------- REJECT ---------- */

  async function reject(id: string) {
    await supabase
      .from('distributor_company_access')
      .update({
        status: 'rejected',
      })
      .eq('id', id)

    setRequests(prev =>
      prev.map(r =>
        r.id === id ? { ...r, status: 'rejected' } : r
      )
    )
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

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* 🔶 Pending */}

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