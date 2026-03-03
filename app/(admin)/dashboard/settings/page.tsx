'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import SendNotification from '../components/SendNotification'

export default function SettingsPage() {
  const supabase = supabaseBrowser

  const [companyId, setCompanyId] = useState('')
  const [company, setCompany] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)

  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [address, setAddress] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] =
    useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
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
    setCompanyId(company.id)
    setDisplayName(company.display_name || '')
    setPhone(company.phone || '')
    setEmail(company.email || '')
    setWhatsapp(company.whatsapp || '')
    setAddress(company.address || '')
    setLogoUrl(company.logo_url || null)

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('company_id', company.id)
      .single()

    setSubscription(subscription)
    setLoading(false)
  }

  async function handleSave() {
    if (!companyId) return

    setSaving(true)

    await supabase
      .from('companies')
      .update({
        display_name: displayName,
        phone,
        email,
        whatsapp,
        address,
      })
      .eq('id', companyId)

    setSaving(false)
  }

  async function handleSubscribe(planType: string) {
    setSubscriptionLoading(true)

    const res = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planType, companyId }),
    })

    const data = await res.json()

    if (!data.subscriptionId) {
      alert(data.error || 'Subscription failed')
      setSubscriptionLoading(false)
      return
    }

    const rzp = new (window as any).Razorpay({
      key: data.key,
      subscription_id: data.subscriptionId,
      name: 'Vitrino',
      description: 'Vitrino Subscription',
      handler: function () {
        window.location.reload()
      },
    })

    rzp.open()
    setSubscriptionLoading(false)
  }

  if (loading) {
    return <div>Loading settings...</div>
  }

  return (
    <div className="max-w-4xl space-y-8">

      <h1 className="text-2xl font-semibold">
        Settings
      </h1>

      {/* 🔹 Logo */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="font-semibold mb-4">
          Company Logo
        </h2>

        {logoUrl ? (
          <img
            src={logoUrl}
            className="w-32 h-32 object-contain border rounded"
          />
        ) : (
          <div className="text-gray-400">
            No logo uploaded
          </div>
        )}
      </div>

      {/* 🔹 Company Info */}
      <div className="bg-white p-6 rounded-xl shadow border space-y-4">
        <h2 className="font-semibold">
          Company Information
        </h2>

        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Company Name"
          className="border px-4 py-2 rounded w-full"
        />

        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          className="border px-4 py-2 rounded w-full"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-6 py-2 rounded"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* 🔹 Contact */}
      <div className="bg-white p-6 rounded-xl shadow border space-y-4">
        <h2 className="font-semibold">
          Contact Details
        </h2>

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          className="border px-4 py-2 rounded w-full"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border px-4 py-2 rounded w-full"
        />

        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="WhatsApp"
          className="border px-4 py-2 rounded w-full"
        />
      </div>

      {/* 🔥 Subscription */}
{/* 🔥 Subscription */}
{subscription && (
  <div className="bg-white p-6 rounded-xl shadow border space-y-4">
    <h2 className="font-semibold text-lg">
      Subscription
    </h2>

    {/* Status + Plan */}
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">
          Plan
        </p>
        <p className="font-semibold capitalize">
          {subscription.plan_type}
        </p>
      </div>

      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          subscription.status === 'active'
            ? 'bg-green-100 text-green-700'
            : subscription.status === 'trialing'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        {subscription.status}
      </span>
    </div>

    {/* Remaining Days */}
    {(() => {
      const now = new Date()

      const expiryDate =
        subscription.status === 'trialing'
          ? subscription.trial_ends_at
          : subscription.status === 'active'
          ? subscription.current_period_end
          : null

      if (!expiryDate) return null

      const totalDays = 30 // fallback visual reference
      const remainingDays = Math.ceil(
        (new Date(expiryDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      )

      const percentage =
        remainingDays > 0
          ? Math.min((remainingDays / totalDays) * 100, 100)
          : 0

      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {remainingDays > 0
              ? `${remainingDays} day${
                  remainingDays === 1 ? '' : 's'
                } remaining`
              : 'Expired'}
          </p>

          <div className="w-full h-2 bg-gray-200 rounded">
            <div
              className={`h-2 rounded ${
                remainingDays <= 5
                  ? 'bg-red-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-xs text-gray-400">
            Expires on{' '}
            {new Date(expiryDate).toLocaleDateString()}
          </p>
        </div>
      )
    })()}

    {/* Upgrade Buttons */}
    {subscription.status !== 'active' && (
      <div className="pt-4 flex gap-4">
        <button
          onClick={() => handleSubscribe('monthly')}
          disabled={subscriptionLoading}
          className="bg-black text-white px-6 py-2 rounded"
        >
          Monthly ₹399
        </button>

        <button
          onClick={() => handleSubscribe('quarterly')}
          disabled={subscriptionLoading}
          className="bg-black text-white px-6 py-2 rounded"
        >
          Quarterly ₹1099
        </button>

        <button
          onClick={() => handleSubscribe('yearly')}
          disabled={subscriptionLoading}
          className="bg-black text-white px-6 py-2 rounded"
        >
          Yearly ₹3999
        </button>
      </div>
    )}
  </div>
)}

      {/* 🔔 Notifications */}
      {companyId && (
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="font-semibold mb-4">
            Send Notification
          </h2>
          <SendNotification companyId={companyId} />
        </div>
      )}

    </div>
  )
}