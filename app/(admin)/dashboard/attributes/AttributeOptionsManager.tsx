'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

type AttributeOption = {
  id: string
  attribute_id: string
  value: string
  is_active: boolean
  sort_order: number | null
}

interface AttributeOptionsManagerProps {
  attributeId: string
}

export default function AttributeOptionsManager({
  attributeId,
}: AttributeOptionsManagerProps) {
  const supabase = supabaseBrowser

  const [options, setOptions] = useState<AttributeOption[]>([])
  const [newOption, setNewOption] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadOptions() {
    const { data, error } = await supabase
      .from('attribute_options')
      .select('*')
      .eq('attribute_id', attributeId)
      .order('sort_order')

    if (error) {
      console.error(error)
      return
    }

    setOptions(data || [])
  }

  useEffect(() => {
    if (attributeId) {
      loadOptions()
    }
  }, [attributeId])

  async function addOption() {
    if (!newOption.trim()) return

    setLoading(true)

    const { error } = await supabase
      .from('attribute_options')
      .insert({
        attribute_id: attributeId,
        value: newOption.trim(),
        is_active: true,
      })

    if (error) {
      alert(error.message)
      console.error(error)
      setLoading(false)
      return
    }

    setNewOption('')
    setLoading(false)
    loadOptions()
  }

  async function updateOption(id: string) {
    if (!editValue.trim()) return

    setLoading(true)

    const { error } = await supabase
      .from('attribute_options')
      .update({ value: editValue.trim() })
      .eq('id', id)

    if (error) {
      alert(error.message)
      console.error(error)
      setLoading(false)
      return
    }

    setEditingId(null)
    setEditValue('')
    setLoading(false)
    loadOptions()
  }

  async function toggleOption(option: AttributeOption) {
    const { error } = await supabase
      .from('attribute_options')
      .update({ is_active: !option.is_active })
      .eq('id', option.id)

    if (error) {
      alert(error.message)
      console.error(error)
      return
    }

    loadOptions()
  }

  return (
    <div className="mt-3 space-y-2">
      {/* Add Option */}
      <div className="flex gap-2">
        <input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          placeholder="Add option"
          className="border px-2 py-1 text-sm flex-1 rounded"
        />
        <button
          onClick={addOption}
          disabled={loading}
          className="bg-black text-white px-3 py-1 text-sm rounded hover:opacity-90"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>

      {/* Options List */}
      <div className="space-y-1">
        {options.map((opt) => (
          <div
            key={opt.id}
            className={`flex justify-between items-center border px-2 py-1 rounded text-sm ${
              !opt.is_active ? 'opacity-50' : ''
            }`}
          >
            {editingId === opt.id ? (
              <div className="flex gap-2 flex-1">
                <input
                  value={editValue}
                  onChange={(e) =>
                    setEditValue(e.target.value)
                  }
                  className="border px-2 py-1 text-sm flex-1 rounded"
                />
                <button
                  onClick={() => updateOption(opt.id)}
                  className="text-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingId(null)
                    setEditValue('')
                  }}
                  className="text-gray-500"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span>{opt.value}</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditingId(opt.id)
                      setEditValue(opt.value)
                    }}
                    className="text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleOption(opt)}
                    className="text-red-600"
                  >
                    {opt.is_active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}