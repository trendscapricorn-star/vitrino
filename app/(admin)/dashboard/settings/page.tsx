'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import SendNotification from '../components/SendNotification'

export default function SettingsPage() {

  const supabase = supabaseBrowser

  const [companyId,setCompanyId] = useState('')
  const [subscription,setSubscription] = useState<any>(null)

  const [displayName,setDisplayName] = useState('')
  const [phone,setPhone] = useState('')
  const [email,setEmail] = useState('')
  const [whatsapp,setWhatsapp] = useState('')
  const [address,setAddress] = useState('')
  const [logoUrl,setLogoUrl] = useState<string | null>(null)

  const [description,setDescription] = useState('')
  const [keywords,setKeywords] = useState<string[]>([])
  const [generating,setGenerating] = useState(false)

  const [loading,setLoading] = useState(true)
  const [saving,setSaving] = useState(false)
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

    setCompanyId(company.id)

    setDisplayName(company.display_name || '')
    setPhone(company.phone || '')
    setEmail(company.email || '')
    setWhatsapp(company.whatsapp || '')
    setAddress(company.address || '')
    setLogoUrl(company.logo_url || null)

    setDescription(company.business_description || '')

    if(Array.isArray(company.business_tags)){
      setKeywords(company.business_tags)
    } else if(typeof company.business_tags === 'string'){
      setKeywords(company.business_tags.split(' '))
    } else {
      setKeywords([])
    }

    const { data:subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('company_id',company.id)
      .single()

    setSubscription(subscription)

    setLoading(false)
  }

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

    await supabase
      .from('companies')
      .update({
        display_name:displayName,
        phone,
        email,
        whatsapp,
        address,
        business_description:description,
        business_tags:keywords,
        business_tags_text:keywords.join(' ')
      })
      .eq('id',companyId)

    setSaving(false)

    alert('Saved successfully')
  }

  async function handleLogoUpload(e:any){

    const file = e.target.files?.[0]
    if(!file || !companyId) return

    setUploadingLogo(true)

    const filePath = `${companyId}/logo_${Date.now()}.png`

    await supabase.storage
      .from('company-logos')
      .upload(filePath,file,{ upsert:true })

    const { data } = supabase.storage
      .from('company-logos')
      .getPublicUrl(filePath)

    await supabase
      .from('companies')
      .update({ logo_url:data.publicUrl })
      .eq('id',companyId)

    setLogoUrl(data.publicUrl)

    setUploadingLogo(false)
  }

  if(loading){
    return <div>Loading...</div>
  }

  return (

  <div className="max-w-6xl space-y-8">

    <h1 className="text-2xl font-semibold">Settings</h1>

    {/* 🔹 ROW 1 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* BUSINESS */}
      <div className="bg-white p-6 rounded-xl shadow border space-y-4">

        <h2 className="font-semibold">Business Description & Keywords</h2>

        <textarea
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
          className="border px-4 py-2 rounded w-full"
          rows={4}
        />

        <button
          onClick={handleGenerate}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {generating ? 'Generating...' : 'Generate Keywords'}
        </button>

        <div className="flex flex-wrap gap-2">
          {keywords.map((tag,index)=>(
            <div key={index} className="bg-gray-100 px-3 py-1 rounded text-sm flex gap-2">
              {tag}
              <button onClick={()=>setKeywords(keywords.filter((_,i)=>i!==index))}>×</button>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="bg-black text-white px-6 py-2 rounded"
        >
          Save Business
        </button>

      </div>

      {/* LOGO */}
      <div className="bg-white p-6 rounded-xl shadow border space-y-4">

        <h2 className="font-semibold">Company Logo</h2>

        {logoUrl ? (
          <img src={logoUrl} className="w-32 h-32 object-contain border rounded"/>
        ) : (
          <div className="text-gray-400">No logo uploaded</div>
        )}

        <input type="file" onChange={handleLogoUpload}/>

        {uploadingLogo && (
          <p className="text-sm text-gray-500">Uploading logo...</p>
        )}

      </div>

    </div>

    {/* 🔹 ROW 2 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* COMPANY INFO */}
      <div className="bg-white p-6 rounded-xl shadow border space-y-4">

        <h2 className="font-semibold">Company Information</h2>

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
          className="bg-black text-white px-6 py-2 rounded"
        >
          Save Company
        </button>

      </div>

      {/* CONTACT */}
      <div className="bg-white p-6 rounded-xl shadow border space-y-4">

        <h2 className="font-semibold">Contact Details</h2>

        <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Phone" className="border px-4 py-2 rounded w-full"/>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="border px-4 py-2 rounded w-full"/>
        <input value={whatsapp} onChange={(e)=>setWhatsapp(e.target.value)} placeholder="WhatsApp" className="border px-4 py-2 rounded w-full"/>

      </div>

    </div>

    {/* 🔹 ROW 3 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {subscription && (
        <div className="bg-white p-6 rounded-xl shadow border space-y-4">
          <h2 className="font-semibold text-lg">Subscription</h2>
          <p className="capitalize">{subscription.plan_type}</p>
        </div>
      )}

      {companyId && (
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="font-semibold mb-4">Send Notification</h2>
          <SendNotification companyId={companyId}/>
        </div>
      )}

    </div>

  </div>
  )
}