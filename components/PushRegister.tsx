'use client'

import { useEffect } from 'react'
import { getMessaging, getToken, isSupported } from 'firebase/messaging'
import { initializeApp, getApps } from 'firebase/app'

export default function PushRegister({ companyId }: { companyId: string }) {

  useEffect(() => {

    async function registerPush() {

      // Ensure running in browser
      if (typeof window === 'undefined') return

      const supported = await isSupported()
      if (!supported) return

  const firebaseConfig = {
  apiKey: "AIzaSyBfq9JB_Rq6C3lgyAa5bnkmqJx79IGgafY",
  authDomain: "vitrino-push.firebaseapp.com",
  projectId: "vitrino-push",
  storageBucket: "vitrino-push.firebasestorage.app",
  messagingSenderId: "345907703597",
  appId: "1:345907703597:web:48ecd87b4f6c1e74a42da4"
};

      const app =
        getApps().length === 0
          ? initializeApp(firebaseConfig)
          : getApps()[0]

      const messaging = getMessaging(app)

      try {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

const registration = await navigator.serviceWorker.ready

        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        })

        if (!token) return

        await fetch('/api/push/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, companyId }),
        })

      } catch (err) {
        console.error('Push registration error:', err)
      }
    }

    registerPush()

  }, [companyId])

  return null
}