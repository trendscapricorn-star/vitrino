'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function DashboardPage() {
  const supabase = supabaseBrowser

  const [company, setCompany] = useState<any>(null)
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
  })
  const [subscription, setSubscription] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
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

    /* 🔢 Counts */
    const { count: categoryCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)

    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)

    setStats({
      categories: categoryCount || 0,
      products: productCount || 0,
    })

    /* 💳 Subscription */
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('company_id', company.id)
      .single()

    setSubscription(subscription)

    /* 📊 Activity */
    const { data: events } = await supabase
      .from('catalog_events')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const productIds = [
      ...new Set(
        (events || [])
          .map((e: any) => e.product_id)
          .filter(Boolean)
      ),
    ]

    let productMap: any = {}

    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds)

      productMap = Object.fromEntries(
        (products || []).map((p: any) => [p.id, p.name])
      )
    }

    const enriched = (events || []).map((e: any) => ({
      ...e,
      product_name: productMap[e.product_id] || 'Product',
    }))

    setRecentActivity(enriched)

    setLoading(false)
  }

  if (loading) {
    return <div className="text-gray-500">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8">

      {/* 🔥 Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Categories" value={stats.categories} />
        <StatCard title="Products" value={stats.products} />
      </div>

      {/* 🔹 Subscription + Store Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {subscription && (
          <div className="bg-white rounded-xl shadow p-6 border">
            <h2 className="text-lg font-semibold mb-2">Subscription</h2>

            <div className="text-sm text-gray-600 space-y-1">
              <p>Plan: <strong>{subscription.plan_type}</strong></p>
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

        {company && (
          <div className="bg-white rounded-xl shadow p-6 border">
            <h2 className="text-lg font-semibold mb-2">Your Store Link</h2>

            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded">
              <span className="text-sm text-gray-700 truncate">
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

      {/* 📊 Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 border max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">
            Recent Activity
          </h2>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm text-gray-700 border-b pb-2"
              >
                <div>
                  <strong>{item.visitor_id}</strong> viewed{' '}
                  <strong>{item.product_name}</strong>
                </div>

                <div className="text-gray-400">
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

function StatCard({
  title,
  value,
}: {
  title: string
  value: number
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  )
}