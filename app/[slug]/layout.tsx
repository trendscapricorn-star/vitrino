export const runtime = 'edge'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PushRegister from '@/components/PushRegister'

/* =========================
   Dynamic Metadata (Next 16 Safe)
========================= */
export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {

  const { slug } = await props.params

  const supabase = await createSupabaseServerClient()

  const { data: company } = await supabase
    .from('companies')
    .select(`
      display_name,
      logo_icon_192_url,
      logo_icon_512_url
    `)
    .eq('slug', slug)
    .single()

  const name = company?.display_name || 'Catalog'

  return {
    title: name,
    description: `${name} Digital Catalog`,
    manifest: `/api/manifest?slug=${slug}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: name,
    },
    icons: {
      icon: company?.logo_icon_192_url || '/icon-192.png',
      apple: company?.logo_icon_192_url || '/icon-192.png',
    },
    openGraph: {
      title: name,
      description: `${name} Digital Catalog`,
      images: [
        {
          url: company?.logo_icon_512_url || '/icon-512.png',
          width: 512,
          height: 512,
        },
      ],
    },
  }
}

/* =========================
   Layout Component (Next 16 Safe)
========================= */
export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {

  const { slug } = await params

  const supabase = await createSupabaseServerClient()

  const { data: company } = await supabase
    .from('companies')
    .select('id, display_name, logo_url, address, whatsapp')
    .eq('slug', slug)
    .single()

  if (!company) return notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href={`/${slug}`} className="flex items-center gap-3">
            {company.logo_url && (
              <img
                src={company.logo_url}
                alt={company.display_name}
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

          <div className="flex items-center gap-4">
            {company.whatsapp && (
              <a
                href={`https://wa.me/${company.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
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

      <main>{children}</main>

      {/* 🔔 Push Registration */}
      <PushRegister companyId={company.id} />
    </div>
  )
}