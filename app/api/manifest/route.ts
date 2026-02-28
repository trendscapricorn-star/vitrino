import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  const baseManifest = {
    id: '/',
    name: 'Vitrino',
    short_name: 'Vitrino',
    description: 'Digital Catalog',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#000000',
    lang: 'en',
    categories: ['business', 'shopping'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }

  if (!slug) {
    return NextResponse.json(baseManifest)
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
    short_name: name.length > 12 ? name.substring(0, 12) : name,
    description: `${name} Digital Catalog`,
    start_url: `/${slug}`,
    scope: `/${slug}`,
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#000000',
    lang: 'en',
    categories: ['business', 'shopping'],
    icons: [
      {
        src: company?.logo_icon_192_url || '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: company?.logo_icon_512_url || '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: company?.logo_icon_512_url || '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  })
}