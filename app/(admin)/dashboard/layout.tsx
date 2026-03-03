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

  /* 🔐 Validate session */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  /* 🏢 Load company */
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!company) {
    redirect('/dashboard/setup')
  }

  /* 💳 Load subscription */
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, trial_ends_at, current_period_end, plan_type')
    .eq('company_id', company.id)
    .single()

  let banner: React.ReactNode = null

  if (subscription) {
    const now = new Date()

    const expiryDate =
      subscription.status === 'trialing'
        ? subscription.trial_ends_at
        : subscription.status === 'active'
        ? subscription.current_period_end
        : null

    if (expiryDate) {
      const daysLeft = Math.ceil(
        (new Date(expiryDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      )

      if (daysLeft <= 5 && daysLeft > 0) {
        banner = (
          <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-900 px-6 py-3 text-sm">
            {subscription.status === 'trialing'
              ? `Trial ends in ${daysLeft} day${
                  daysLeft === 1 ? '' : 's'
                }. Upgrade to avoid interruption.`
              : `Subscription renews in ${daysLeft} day${
                  daysLeft === 1 ? '' : 's'
                }.`}
          </div>
        )
      }

      if (daysLeft <= 0) {
        banner = (
          <div className="bg-red-100 border-b border-red-300 text-red-900 px-6 py-3 text-sm">
            Subscription expired. Please upgrade to continue.
          </div>
        )
      }
    }
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

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {banner}

        <main className="flex-1 p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}