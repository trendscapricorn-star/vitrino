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

  const [description,setDescription] = useState('')
  const [keywords,setKeywords] = useState<string[]>([])
  const [generating,setGenerating] = useState(false)

  const [loading,setLoading] = useState(true)
  const [saving,setSaving] = useState(false)
  const [subscriptionLoading,setSubscriptionLoading] = useState(false)
  const [uploadingLogo,setUploadingLogo] = useState(false)

  const [completion,setCompletion] = useState(0)
  const [missing,setMissing] = useState<string[]>([])

  useEffect(()=>{
    loadData()
  },[])

  useEffect(()=>{
    calculateCompletion()
  },[displayName,phone,email,whatsapp,address,logoUrl,description,keywords])

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

    setDescription(company.business_description || '')

    let loadedKeywords: string[] = []
    if (Array.isArray(company.business_tags)) {
      loadedKeywords = company.business_tags
    } else if (typeof company.business_tags === 'string') {
      loadedKeywords = company.business_tags.split(' ')
    }

    setKeywords(loadedKeywords)

    const { data:subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('company_id',company.id)
      .single()

    setSubscription(subscription)

    setLoading(false)
  }

  function calculateCompletion(){

    let score = 0
    const missingFields: string[] = []

    if(displayName) score += 10; else missingFields.push('Company Name')
    if(logoUrl) score += 15; else missingFields.push('Logo')
    if(description) score += 20; else missingFields.push('Business Description')
    if(keywords.length > 0) score += 20; else missingFields.push('Keywords')
    if(phone) score += 10; else missingFields.push('Phone')
    if(email) score += 10; else missingFields.push('Email')
    if(whatsapp) score += 10; else missingFields.push('WhatsApp')
    if(address) score += 5; else missingFields.push('Address')

    setCompletion(score)
    setMissing(missingFields)
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

    alert('Saved')
  }

  async function handleLogoUpload(e:any){

    const file = e.target.files?.[0]
    if(!file || !companyId) return

    setUploadingLogo(true)

    const filePath = `${companyId}/logo_${Date.now()}.png`

    await supabase.storage
      .from('company-logos')
      .upload(filePath,file,{ upsert:true })

    const { data } = supabase.storage.from('company-logos').getPublicUrl(filePath)

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

      {/* 🔥 COMPLETION */}
      <div className="bg-white p-6 rounded-xl shadow border space-y-2">
        <div className="flex justify-between">
          <span>Profile Completion</span>
          <span className="font-semibold">{completion}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded h-2">
          <div
            className="bg-black h-2 rounded"
            style={{ width: `${completion}%` }}
          />
        </div>

        {missing.length > 0 && (
          <p className="text-sm text-red-500">
            Missing: {missing.join(', ')}
          </p>
        )}
      </div>

      {/* 🔹 ROW 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-xl shadow border space-y-4">
          <h2 className="font-semibold">Business</h2>

          <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="border w-full p-2"/>

          <button onClick={handleGenerate} className="bg-black text-white px-4 py-2 rounded">
            Generate Keywords
          </button>

          <div className="flex flex-wrap gap-2">
            {keywords.map((tag,i)=>(
              <div key={i} className="bg-gray-100 px-2 py-1 rounded">
                {tag}
              </div>
            ))}
          </div>

          <button onClick={handleSave} className="bg-black text-white px-4 py-2 rounded">
            Save Business
          </button>

        </div>

        <div className="bg-white p-6 rounded-xl shadow border space-y-4">
          <h2 className="font-semibold">Logo</h2>
          {logoUrl && <img src={logoUrl} className="w-32"/>}
          <input type="file" onChange={handleLogoUpload}/>
        </div>

      </div>

      {/* 🔹 ROW 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-xl shadow border space-y-4">
          <input value={displayName} onChange={(e)=>setDisplayName(e.target.value)} className="border w-full p-2"/>
          <textarea value={address} onChange={(e)=>setAddress(e.target.value)} className="border w-full p-2"/>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border space-y-4">
          <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="border w-full p-2"/>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} className="border w-full p-2"/>
          <input value={whatsapp} onChange={(e)=>setWhatsapp(e.target.value)} className="border w-full p-2"/>
        </div>

      </div>

      {/* 🔹 ROW 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {subscription && (
          <div className="bg-white p-6 rounded-xl shadow border">
            {subscription.plan_type}
          </div>
        )}

        {companyId && (
          <div className="bg-white p-6 rounded-xl shadow border">
            <SendNotification companyId={companyId}/>
          </div>
        )}

      </div>

    </div>
  )
}