import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({
      name: 'Vitrino',
      short_name: 'Vitrino',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#000000',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    })
  }

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

  return NextResponse.json({
    id: `/${slug}`,
    name,
    short_name: name,
    description: `${name} Digital Catalog`,
    start_url: `/${slug}`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: company?.logo_icon_192_url || '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: company?.logo_icon_512_url || '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  })
}