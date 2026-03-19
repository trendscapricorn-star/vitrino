'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import SendNotification from '../components/SendNotification'

export default function SettingsPage() {

  const supabase = supabaseBrowser

  const [companyId,setCompanyId] = useState('')
  const [company,setCompany] = useState<any>(null)
  const [subscription,setSubscription] = useState<any>(null)

  const [displayName,setDisplayName] = useState('')
  const [phone,setPhone] = useState('')
  const [email,setEmail] = useState('')
  const [whatsapp,setWhatsapp] = useState('')
  const [address,setAddress] = useState('')
  const [logoUrl,setLogoUrl] = useState<string | null>(null)

  /* ✅ NEW */
  const [description,setDescription] = useState('')
  const [keywords,setKeywords] = useState<string[]>([])
  const [generating,setGenerating] = useState(false)

  const [loading,setLoading] = useState(true)
  const [saving,setSaving] = useState(false)
  const [subscriptionLoading,setSubscriptionLoading] = useState(false)
  const [uploadingLogo,setUploadingLogo] = useState(false)

  useEffect(()=>{
    loadData()
  },[])

  async function loadData(){

    const { data:{ user } } = await supabase.auth.getUser()

    if(!user){
      setLoading(false)
      return
    }

    const { data:company } = await supabase
      .from('companies')
      .select('*')
      .eq('auth_user_id',user.id)
      .single()

    if(!company){
      setLoading(false)
      return
    }

    setCompany(company)
    setCompanyId(company.id)

    setDisplayName(company.display_name || '')
    setPhone(company.phone || '')
    setEmail(company.email || '')
    setWhatsapp(company.whatsapp || '')
    setAddress(company.address || '')
    setLogoUrl(company.logo_url || null)

    /* ✅ LOAD NEW */
    setDescription(company.business_description || '')
    setKeywords(company.business_tags || [])

    const { data:subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('company_id',company.id)
      .single()

    setSubscription(subscription)

    setLoading(false)
  }

  /* 🔥 AI GENERATE */
  async function handleGenerate(){

    if(!description){
      alert('Please enter business description')
      return
    }

    setGenerating(true)

    const res = await fetch('/api/ai',{
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({
        mode:'keyword_generate',
        description
      })
    })

    const data = await res.json()

    setKeywords(data.tags || [])

    setGenerating(false)
  }

  async function handleSave(){

    if(!companyId) return

    setSaving(true)

    const { error } = await supabase
      .from('companies')
      .update({
        display_name:displayName,
        phone,
        email,
        whatsapp,
        address,

        /* ✅ SAVE NEW */
        business_description:description,
        business_tags:keywords,
        business_tags_text:keywords.join(' ')
      })
      .eq('id',companyId)

    setSaving(false)

    if(error){
      alert('Failed to save settings')
      return
    }

    alert('Settings saved')
  }

  async function handleLogoUpload(e:any){

    const file = e.target.files?.[0]

    if(!file || !companyId) return

    setUploadingLogo(true)

    const filePath = `${companyId}/logo_${Date.now()}.png`

    const { error } = await supabase.storage
      .from('company-logos')
      .upload(filePath,file,{ upsert:true })

    if(error){
      alert('Logo upload failed')
      setUploadingLogo(false)
      return
    }

    const { data } = supabase
      .storage
      .from('company-logos')
      .getPublicUrl(filePath)

    const publicUrl = data.publicUrl

    await supabase
      .from('companies')
      .update({ logo_url:publicUrl })
      .eq('id',companyId)

    setLogoUrl(publicUrl)

    setUploadingLogo(false)
  }

  async function handleSubscribe(planType:string){

    if(subscriptionLoading) return

    setSubscriptionLoading(true)

    const res = await fetch('/api/create-subscription',{
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({ planType,companyId })
    })

    const data = await res.json()

    if(!data.subscriptionId){
      alert(data.error || 'Subscription failed')
      setSubscriptionLoading(false)
      return
    }

    const rzp = new (window as any).Razorpay({
      key:data.key,
      subscription_id:data.subscriptionId,
      name:'Vitrino',
      description:'Vitrino Subscription',
      handler:function(){
        window.location.reload()
      }
    })

    rzp.open()

    setSubscriptionLoading(false)
  }

  if(loading){
    return <div>Loading settings...</div>
  }

  return (

    <div className="max-w-4xl space-y-8">

      <h1 className="text-2xl font-semibold">
        Settings
      </h1>

      {/* 🔥 NEW: BUSINESS DESCRIPTION + AI */}

      <div className="bg-white p-6 rounded-xl shadow border space-y-4">

        <h2 className="font-semibold">
          Business Description & Keywords
        </h2>

        <p className="text-sm text-gray-500">
          Describe your business properly so AI can generate best search keywords for distributors to find you.
        </p>

        <textarea
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
          className="border px-4 py-2 rounded w-full"
          rows={4}
          placeholder="Example: We manufacture premium denim jeans for men, bulk supply, export quality..."
        />

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {generating ? 'Generating...' : 'Generate Keywords'}
        </button>

        {/* KEYWORDS */}

        <div className="flex flex-wrap gap-2">

          {keywords.map((tag,index)=>(
            <div key={index} className="bg-gray-100 px-3 py-1 rounded text-sm flex items-center gap-2">
              {tag}
              <button
                onClick={()=>setKeywords(keywords.filter((_,i)=>i!==index))}
                className="text-red-500"
              >
                ×
              </button>
            </div>
          ))}

        </div>

        <input
          placeholder="Add keyword"
          className="border px-3 py-2 rounded w-full"
          onKeyDown={(e)=>{
            if(e.key === 'Enter'){
              e.preventDefault()
              const val = (e.target as HTMLInputElement).value.trim()
              if(val){
                setKeywords([...keywords,val])
                ;(e.target as HTMLInputElement).value = ''
              }
            }
          }}
        />

      </div>

      {/* LOGO */}

      <div className="bg-white p-6 rounded-xl shadow border space-y-4">

        <h2 className="font-semibold">
          Company Logo
        </h2>

        {logoUrl ? (
          <img src={logoUrl} className="w-32 h-32 object-contain border rounded"/>
        ):(<div className="text-gray-400">No logo uploaded</div>)}

        <input type="file" accept="image/*" onChange={handleLogoUpload}/>

        {uploadingLogo && <p className="text-sm text-gray-500">Uploading logo...</p>}

      </div>

      {/* COMPANY INFO */}

      <div className="bg-white p-6 rounded-xl shadow border space-y-4">

        <h2 className="font-semibold">
          Company Information
        </h2>

        <input
          value={displayName}
          onChange={(e)=>setDisplayName(e.target.value)}
          placeholder="Company Name"
          className="border px-4 py-2 rounded w-full"
        />

        <textarea
          value={address}
          onChange={(e)=>setAddress(e.target.value)}
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

      {/* CONTACT */}

      <div className="bg-white p-6 rounded-xl shadow border space-y-4">

        <h2 className="font-semibold">
          Contact Details
        </h2>

        <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Phone" className="border px-4 py-2 rounded w-full"/>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="border px-4 py-2 rounded w-full"/>
        <input value={whatsapp} onChange={(e)=>setWhatsapp(e.target.value)} placeholder="WhatsApp" className="border px-4 py-2 rounded w-full"/>

      </div>

      {/* SUBSCRIPTION */}

      {subscription && (
        <div className="bg-white p-6 rounded-xl shadow border space-y-4">
          <h2 className="font-semibold text-lg">Subscription</h2>

          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Plan</p>
              <p className="font-semibold capitalize">{subscription.plan_type}</p>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              subscription.status === 'active'
                ? 'bg-green-100 text-green-700'
                : subscription.status === 'trialing'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {subscription.status}
            </span>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS */}

      {companyId && (
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="font-semibold mb-4">Send Notification</h2>
          <SendNotification companyId={companyId}/>
        </div>
      )}

    </div>
  )
}