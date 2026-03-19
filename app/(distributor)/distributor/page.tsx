'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function DistributorDashboard() {
  const supabase = getSupabaseClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [connectedCount, setConnectedCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [inviteCount, setInviteCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: distributor, error: distError } = await supabase
        .from('distributors')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (distError || !distributor) {
        setError('Distributor profile not found')
        setLoading(false)
        return
      }

      const { data: connections, error: connError } = await supabase
        .from('distributor_company_access')
        .select('status')
        .eq('distributor_id', distributor.id)

      if (connError) {
        setError(connError.message)
        setLoading(false)
        return
      }

      const approved = connections?.filter(c => c.status === 'approved').length || 0
      const pending = connections?.filter(c => c.status === 'pending').length || 0
      const invited = connections?.filter(c => c.status === 'invited').length || 0

      setConnectedCount(approved)
      setPendingCount(pending)
      setInviteCount(invited)

      setLoading(false)
    }

    loadDashboard()
  }, [supabase, router])

  return (
    <div className="min-h-screen bg-zinc-50 p-6">

      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER */}
        <h1 className="text-2xl font-semibold">
          Distributor Dashboard
        </h1>

        {/* LOADING */}
        {loading && <p className="text-zinc-500">Loading...</p>}

        {/* ERROR */}
        {error && <p className="text-red-500">{error}</p>}

        {/* STATS */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-4">

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-sm text-zinc-500">
                Connected
              </p>
              <p className="text-2xl font-semibold">
                {connectedCount}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-sm text-zinc-500">
                Pending
              </p>
              <p className="text-2xl font-semibold">
                {pendingCount}
              </p>
            </div>

            <div
              onClick={() => router.push('/distributor/companies')}
              className="bg-white p-6 rounded-xl shadow cursor-pointer"
            >
              <p className="text-sm text-zinc-500">
                Invitations
              </p>
              <p className="text-2xl font-semibold text-yellow-600">
                {inviteCount}
              </p>
            </div>

          </div>
        )}

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-4">

          <button
            onClick={() => router.push('/distributor/companies')}
            className="bg-black text-white p-4 rounded-xl"
          >
            View My Manufacturers
          </button>

          <button
            onClick={() => router.push('/distributor/discover')}
            className="bg-white border p-4 rounded-xl"
          >
            Discover Manufacturers
          </button>

        </div>

      </div>

    </div>
  )
}