export const runtime = 'edge'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'

export default async function SlugLayout({
  children,
  params,
}: any) {
  const supabase = await createSupabaseServerClient()
  const { slug } = await params

  const { data: company } = await supabase
    .from('companies')
    .select('id, display_name, logo_url, address, whatsapp')
    .eq('slug', slug)
    .single()

  if (!company) return notFound()

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 🔹 Clean App Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Left */}
          <a
            href={`/${slug}`}
            className="flex items-center gap-3"
          >
            {company.logo_url && (
              <img
                src={company.logo_url}
                className="h-8 object-contain"
              />
            )}

            <div>
              <div className="font-semibold text-lg">
                {company.display_name}
              </div>

              {company.address && (
                <div className="text-xs text-gray-500">
                  {company.address}
                </div>
              )}
            </div>
          </a>

          {/* Right */}
          <div className="flex items-center gap-4">

            {company.whatsapp && (
              <a
                href={`https://wa.me/${company.whatsapp}`}
                target="_blank"
                className="text-sm border px-4 py-1.5 rounded hover:bg-gray-100"
              >
                WhatsApp
              </a>
            )}

            <a
              href="/dashboard"
              className="text-xs text-gray-500 hover:text-black"
            >
              Admin Login
            </a>

          </div>

        </div>
      </header>

      {/* Page Content */}
      <main>{children}</main>

    </div>
  )
}