"use client"

import { useEffect, useState } from "react"

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    await deferredPrompt.userChoice

    setDeferredPrompt(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-6 right-6 bg-black text-white px-5 py-3 rounded-xl shadow-lg z-50"
    >
      Install App
    </button>
  )
}