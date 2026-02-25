export const runtime = 'edge'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import LogoutButton from './LogoutButton'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!company) {
    redirect('/dashboard/setup')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-black text-white p-4">
        <h2 className="text-lg font-bold mb-6">
          {company.display_name}
        </h2>

<nav className="space-y-3 text-sm flex flex-col">
  <Link href="/dashboard">Dashboard</Link>
  <Link href="/dashboard/products">Products</Link>
  <Link href="/dashboard/orders">Orders</Link>
  <Link href="/dashboard/settings">Settings</Link>
<LogoutButton />
</nav>
      </aside>

      <main className="flex-1 p-8 bg-gray-50">
        {children}
      </main>
    </div>
  )
}