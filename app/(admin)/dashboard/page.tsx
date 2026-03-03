'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function DashboardPage() {
  const supabase = supabaseBrowser

  const [company, setCompany] = useState<any>(null)
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    variants: 0,
  })
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    if (!company) return

    setCompany(company)

    /* 🔢 Fetch counts */
    const { count: categoryCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)

    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)

    const { count: variantCount } = await supabase
      .from('variants')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)

    setStats({
      categories: categoryCount || 0,
      products: productCount || 0,
      variants: variantCount || 0,
    })

    /* 💳 Load subscription */
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('company_id', company.id)
      .single()

    setSubscription(subscription)
    setLoading(false)
  }

  if (loading) {
    return <div className="text-gray-500">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8">

      {/* 🔥 Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Categories" value={stats.categories} />
        <StatCard title="Products" value={stats.products} />
        <StatCard title="Variants" value={stats.variants} />
      </div>

      {/* 🔹 Subscription Summary */}
      {subscription && (
        <div className="bg-white rounded-xl shadow p-6 border">
          <h2 className="text-lg font-semibold mb-2">
            Subscription
          </h2>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              Plan: <strong>{subscription.plan_type}</strong>
            </p>

            <p>
              Status:{' '}
              <strong className={
                subscription.status === 'active'
                  ? 'text-green-600'
                  : subscription.status === 'trialing'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }>
                {subscription.status}
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* 🔗 Store Link */}
      {company && (
        <div className="bg-white rounded-xl shadow p-6 border">
          <h2 className="text-lg font-semibold mb-2">
            Your Store Link
          </h2>

          <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded">
            <span className="text-sm text-gray-700">
              {process.env.NEXT_PUBLIC_SITE_URL}/{company.slug}
            </span>

            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  `${process.env.NEXT_PUBLIC_SITE_URL}/${company.slug}`
                )
              }
              className="text-sm text-black font-medium"
            >
              Copy
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

/* 🔹 Reusable Stat Card */
function StatCard({
  title,
  value,
}: {
  title: string
  value: number
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border">
      <div className="text-sm text-gray-500">
        {title}
      </div>
      <div className="text-3xl font-bold mt-2">
        {value}
      </div>
    </div>
  )
}