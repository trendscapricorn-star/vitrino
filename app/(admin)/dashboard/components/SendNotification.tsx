'use client'

import { useState } from 'react'

export default function SendNotification({ companyId }: { companyId: string }) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    if (!title || !message) return alert('Fill required fields')

    setLoading(true)

    const res = await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId,
        title,
        body: message,
        url,
      }),
    })

    setLoading(false)

    if (res.ok) {
      alert('Notification Sent')
      setTitle('')
      setMessage('')
      setUrl('')
    } else {
      alert('Error sending notification')
    }
  }

  return (
    <div className="bg-white p-6 rounded border max-w-xl">
      <h2 className="text-lg font-semibold mb-4">
        Send Notification
      </h2>

      <input
        placeholder="Title"
        className="border px-3 py-2 w-full mb-3"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Message"
        className="border px-3 py-2 w-full mb-3"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <input
        placeholder="Optional URL (e.g. /rcpl-7001/kfj-10001)"
        className="border px-3 py-2 w-full mb-4"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className="bg-black text-white px-5 py-2 rounded"
      >
        {loading ? 'Sending...' : 'Send'}
      </button>
    </div>
  )
}