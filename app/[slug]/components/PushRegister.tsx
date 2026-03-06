'use client'

import { useEffect } from "react"
import { initializeApp, getApps } from "firebase/app"
import { getMessaging, getToken, isSupported } from "firebase/messaging"

export default function PushRegister({ companyId }: { companyId: string }) {

  useEffect(() => {

    async function registerPush() {

      if (typeof window === "undefined") return

      const supported = await isSupported()
      if (!supported) return

      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      }

      const app =
        getApps().length === 0
          ? initializeApp(firebaseConfig)
          : getApps()[0]

      const messaging = getMessaging(app)

      const permission = await Notification.requestPermission()

      if (permission !== "granted") return

      const registration = await navigator.serviceWorker.ready

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
      })

      if (!token) return

      await fetch("/api/push/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          companyId,
          platform: "desktop",
          userAgent: navigator.userAgent
        })
      })

      console.log("FCM TOKEN REGISTERED")

    }

    registerPush()

  }, [companyId])

  return null
}