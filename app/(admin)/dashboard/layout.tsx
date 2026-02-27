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

  // 🔐 Validate session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 🏢 Load company
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
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-6 flex flex-col">
        <h2 className="text-lg font-bold mb-8">
          {company.display_name}
        </h2>

        <nav className="space-y-4 text-sm flex-1">
          <Link
            href="/dashboard"
            className="block hover:text-gray-300"
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard/categories"
            className="block hover:text-gray-300"
          >
            Categories
          </Link>

          <Link
            href="/dashboard/products"
            className="block hover:text-gray-300"
          >
            Products
          </Link>

          <Link
            href="/dashboard/variants"
            className="block hover:text-gray-300"
          >
            Variants
          </Link>

          <Link
            href="/dashboard/attributes"
            className="block hover:text-gray-300"
          >
            Attributes
          </Link>

          <Link
            href="/dashboard/settings"
            className="block hover:text-gray-300"
          >
            Settings
          </Link>
        </nav>

        <div className="pt-6 border-t border-gray-700">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-50">
        {children}
      </main>
    </div>
  )
}