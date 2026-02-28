import { initializeApp, getApps } from 'firebase/app'
import { getMessaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "dummy",
  authDomain: "dummy",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: "dummy",
  appId: "dummy",
}

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0]

export const messaging = getMessaging(app)