import { createSupabaseServerClient } from '@/lib/supabase-server'
import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export default async function manifest(
  { params }: { params: { slug: string } }
): Promise<MetadataRoute.Manifest> {

  const supabase = await createSupabaseServerClient()

  const { data: company } = await supabase
    .from('companies')
    .select(`
      display_name,
      logo_icon_192_url,
      logo_icon_512_url
    `)
    .eq('slug', params.slug)
    .single()

  const name = company?.display_name || 'Catalog'

  return {
    id: `/${params.slug}`,
    name,
    short_name: name,
    description: `${name} Digital Catalog`,
    start_url: `/${params.slug}`,
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
  }
}