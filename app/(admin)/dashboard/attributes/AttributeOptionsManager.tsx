'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function AttributeOptionsManager({ attributeId }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [options, setOptions] = useState([])
  const [newOption, setNewOption] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadOptions() {
    const { data } = await supabase
      .from('attribute_options')
      .select('*')
      .eq('attribute_id', attributeId)
      .order('sort_order')

    setOptions(data || [])
  }

  useEffect(() => {
    loadOptions()
  }, [attributeId])

  async function addOption() {
    if (!newOption.trim()) return

    setLoading(true)

    await supabase.from('attribute_options').insert({
      attribute_id: attributeId,
      value: newOption.trim(),
    })

    setNewOption('')
    setLoading(false)
    loadOptions()
  }

  async function updateOption(id) {
    if (!editValue.trim()) return

    setLoading(true)

    await supabase
      .from('attribute_options')
      .update({ value: editValue.trim() })
      .eq('id', id)

    setEditingId(null)
    setEditValue('')
    setLoading(false)
    loadOptions()
  }

  async function toggleOption(option) {
    await supabase
      .from('attribute_options')
      .update({ is_active: !option.is_active })
      .eq('id', option.id)

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
          className="border px-2 py-1 text-sm flex-1"
        />
        <button
          onClick={addOption}
          disabled={loading}
          className="bg-black text-white px-3 py-1 text-sm rounded"
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
                  className="border px-2 py-1 text-sm flex-1"
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
                    {opt.is_active
                      ? 'Disable'
                      : 'Enable'}
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