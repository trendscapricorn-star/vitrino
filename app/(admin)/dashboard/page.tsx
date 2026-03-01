'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import SendNotification from './components/SendNotification'

/* 🔹 Section Component */
function Section({
  title,
  id,
  openSection,
  setOpenSection,
  children,
}: any) {
  const isOpen = openSection === id

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpenSection(isOpen ? null : id)}
        className="w-full px-6 py-4 bg-gray-50 flex justify-between items-center font-medium"
      >
        {title}
        <span>{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="p-6 bg-white">
          {children}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const supabase = supabaseBrowser

  const [companyId, setCompanyId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [address, setAddress] = useState('')
  const [slug, setSlug] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)
  const [openSection, setOpenSection] = useState<string | null>('logo')

  useEffect(() => {
    loadCompany()
  }, [])

  async function loadCompany() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    if (!company) return

    setCompanyId(company.id)
    setDisplayName(company.display_name || '')
    setPhone(company.phone || '')
    setEmail(company.email || '')
    setWhatsapp(company.whatsapp || '')
    setAddress(company.address || '')
    setSlug(company.slug || '')
    setLogoUrl(company.logo_url || null)

    setInitialLoading(false)
  }

  async function handleSubscribe(planType: string) {
    try {
      setSubscriptionLoading(true)

      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      })

      const data = await res.json()

      if (!data.subscriptionId) {
        alert(data.details || 'Subscription failed')
        return
      }

      const options = {
        key: data.key,
        subscription_id: data.subscriptionId,
        name: 'Vitrino',
        description: 'Vitrino Subscription',
        theme: { color: '#000000' },
        handler: function () {
          window.location.reload()
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()

    } catch (error) {
      console.error(error)
      alert('Something went wrong')
    } finally {
      setSubscriptionLoading(false)
    }
  }

  async function handleSave() {
    if (!companyId) return

    setLoading(true)

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

    setMessage('Changes saved successfully ✓')
    setLoading(false)

    setTimeout(() => setMessage(''), 3000)
  }

  if (initialLoading) {
    return <div className="p-10 text-gray-500">Loading...</div>
  }

  return (
    <div className="max-w-4xl p-8 space-y-6">

      <h1 className="text-2xl font-semibold">
        Branding & Company Settings
      </h1>

      {/* 🔥 Subscription Section */}
      <div className="border rounded-xl p-6 bg-yellow-50 border-yellow-300">
        <h2 className="text-lg font-semibold mb-2">
          Upgrade Subscription
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          Upgrade to continue uninterrupted access.
        </p>

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => handleSubscribe('monthly')}
            disabled={subscriptionLoading}
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            {subscriptionLoading ? 'Processing...' : 'Monthly ₹399'}
          </button>

          <button
            onClick={() => handleSubscribe('quarterly')}
            disabled={subscriptionLoading}
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            Quarterly ₹1099
          </button>

          <button
            onClick={() => handleSubscribe('yearly')}
            disabled={subscriptionLoading}
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            Yearly ₹3999
          </button>
        </div>
      </div>

      {/* 🔹 Company Info Section */}
      <Section
        title="Company Information"
        id="company"
        openSection={openSection}
        setOpenSection={setOpenSection}
      >
        <div className="grid gap-4">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Company Name"
            className="border px-4 py-2 rounded"
          />
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            className="border px-4 py-2 rounded"
          />
        </div>
      </Section>

      {/* 🔹 Save Button */}
      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded-lg"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

        {message && (
          <div className="text-sm text-green-600 mt-3">
            {message}
          </div>
        )}
      </div>

    </div>
  )
}