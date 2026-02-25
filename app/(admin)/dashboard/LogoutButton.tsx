'use client'

import { getSupabaseClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-6 text-sm text-red-400"
    >
      Logout
    </button>
  )
}