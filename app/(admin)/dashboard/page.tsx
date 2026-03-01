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
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [address, setAddress] = useState('')
  const [slug, setSlug] = useState('')

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)

  const [openSection, setOpenSection] =
    useState<string | null>('logo')

  useEffect(() => {
    loadCompany()
  }, [])

  async function loadCompany() {
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

    setCompanyId(company.id)
    setLogoUrl(company.logo_url || null)
    setDisplayName(company.display_name || '')
    setPhone(company.phone || '')
    setEmail(company.email || '')
    setWhatsapp(company.whatsapp || '')
    setAddress(company.address || '')
    setSlug(company.slug || '')
    setInitialLoading(false)
  }

  async function handleSubscribe(planType: string) {
    try {
      setSubscriptionLoading(true)

      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, companyId }),
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

  async function resizeImage(file: File, size: number): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      img.onload = () => {
        canvas.width = size
        canvas.height = size

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, size, size)

        const ratio = Math.min(size / img.width, size / img.height)
        const newWidth = img.width * ratio
        const newHeight = img.height * ratio

        const x = (size - newWidth) / 2
        const y = (size - newHeight) / 2

        ctx.drawImage(img, x, y, newWidth, newHeight)

        canvas.toBlob((blob) => {
          resolve(blob!)
        }, 'image/png')
      }

      img.src = URL.createObjectURL(file)
    })
  }

  async function handleLogoUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    if (!file || !companyId) return

    setLoading(true)

    const blob512 = await resizeImage(file, 512)
    const blob192 = await resizeImage(file, 192)

    const path512 = `${companyId}/icon-512.png`
    const path192 = `${companyId}/icon-192.png`

    await supabase.storage
      .from('company-logos')
      .upload(path512, blob512, { upsert: true })

    await supabase.storage
      .from('company-logos')
      .upload(path192, blob192, { upsert: true })

    const { data: url512 } = supabase.storage
      .from('company-logos')
      .getPublicUrl(path512)

    const { data: url192 } = supabase.storage
      .from('company-logos')
      .getPublicUrl(path192)

    await supabase
      .from('companies')
      .update({
        logo_url: url512.publicUrl,
        logo_icon_512_url: url512.publicUrl,
        logo_icon_192_url: url192.publicUrl,
      })
      .eq('id', companyId)

    setLogoUrl(url512.publicUrl)
    setLoading(false)
  }

  async function handleSave() {
    if (!companyId) return

    setLoading(true)
    setMessage('')

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

    setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  if (initialLoading) {
    return (
      <div className="p-10 text-gray-500">
        Loading company settings...
      </div>
    )
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

      {/* 🔹 Logo Section */}
      <Section
        title="Company Logo"
        id="logo"
        openSection={openSection}
        setOpenSection={setOpenSection}
      >
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 border rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
            {logoUrl ? (
              <img
                src={logoUrl}
                className="object-contain w-full h-full"
              />
            ) : (
              <span className="text-gray-400 text-sm">
                No Logo Uploaded
              </span>
            )}
          </div>

          <label className="cursor-pointer bg-black text-white px-5 py-2 rounded-lg hover:opacity-90 transition">
            {loading ? 'Uploading...' : 'Change Logo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>
        </div>
      </Section>

      {/* 🔹 Company Info */}
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

      {/* 🔹 Contact Info */}
      <Section
        title="Contact Details"
        id="contact"
        openSection={openSection}
        setOpenSection={setOpenSection}
      >
        <div className="grid gap-4">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="border px-4 py-2 rounded"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border px-4 py-2 rounded"
          />

          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="WhatsApp (with country code)"
            className="border px-4 py-2 rounded"
          />
        </div>
      </Section>

      {/* 🔔 Manual Campaign Section */}
      {companyId && (
        <Section
          title="Send Notification"
          id="notification"
          openSection={openSection}
          setOpenSection={setOpenSection}
        >
          <SendNotification companyId={companyId} />
        </Section>
      )}

      {/* 🔹 Save Button */}
      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded-lg hover:opacity-90"
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