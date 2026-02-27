'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

interface Props {
  attributeId: string
  value: string
  onChange: (value: string) => void
}

export default function AttributeSelect({
  attributeId,
  value,
  onChange,
}: Props) {
  const supabase = supabaseBrowser

  const [options, setOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOptions() {
      if (!attributeId) return

      setLoading(true)

      const { data, error } = await supabase
        .from('attribute_options')
        .select('id, value')
        .eq('attribute_id', attributeId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Attribute option error:', error)
      }

      setOptions(data || [])
      setLoading(false)
    }

    loadOptions()
  }, [attributeId])

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      className="border px-2 py-1.5 w-full"
    >
      <option value="">
        {loading ? 'Loading...' : 'Select'}
      </option>

      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.value}
        </option>
      ))}
    </select>
  )
}