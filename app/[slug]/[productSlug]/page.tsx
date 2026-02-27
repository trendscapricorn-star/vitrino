export const runtime = 'edge'

import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import ImageSlider from './ImageSlider'

export default async function ProductPage(props: any) {
  const supabase = await createSupabaseServerClient()

  const params = await props.params
  const slug = params.slug
  const productSlug = params.productSlug

  /* 🔹 Company */
  const { data: company } = await supabase
    .from('companies')
    .select('id, display_name, logo_url, phone, whatsapp, email')
    .eq('slug', slug)
    .single()

  if (!company) return notFound()

  /* 🔹 Product + Attributes */
  const { data: product } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      base_price,
      product_images (
        image_url,
        sort_order
      ),
      product_attribute_values (
        attribute_options (
          value,
          attributes (
            name
          )
        )
      )
    `)
    .eq('company_id', company.id)
    .eq('slug', productSlug)
    .eq('is_active', true)
    .single()

  if (!product) return notFound()

  const images =
    product.product_images
      ?.sort((a: any, b: any) =>
        a.sort_order - b.sort_order
      )
      .map((i: any) => i.image_url) || []

  /* 🔹 Group Attributes Properly */
  const attributeMap: Record<string, string[]> = {}

  product.product_attribute_values?.forEach(
    (item: any) => {
      const attrName =
        item.attribute_options.attributes.name
      const value =
        item.attribute_options.value

      if (!attributeMap[attrName]) {
        attributeMap[attrName] = []
      }

      attributeMap[attrName].push(value)
    }
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Product */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12">

        {/* Slider */}
        <ImageSlider images={images} />

        {/* Details */}
        <div className="space-y-6">

          <h1 className="text-2xl font-semibold">
            {product.name}
          </h1>

          <div className="text-xl font-medium">
            ₹ {product.base_price ?? '-'}
          </div>

          {product.description && (
            <div className="text-gray-600 text-sm leading-relaxed">
              {product.description}
            </div>
          )}

          {/* Attributes */}
          {Object.keys(attributeMap).length > 0 && (
            <div className="space-y-3 pt-4 border-t">

              <div className="font-medium">
                Product Details
              </div>

              {Object.entries(attributeMap).map(
                ([attr, values]) => (
                  <div
                    key={attr}
                    className="text-sm flex gap-2"
                  >
                    <div className="font-medium w-32">
                      {attr}:
                    </div>
                    <div className="text-gray-600">
                      {values.join(', ')}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Compact Enquiry */}
          <div className="border-t pt-6 space-y-2">

            <div className="text-sm font-medium">
              Interested?
            </div>

            <div className="flex gap-3">

              {company.whatsapp && (
                <a
                  href={`https://wa.me/${company.whatsapp}?text=I'm interested in ${product.name}`}
                  target="_blank"
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:opacity-90"
                >
                  WhatsApp
                </a>
              )}

              {company.phone && (
                <a
                  href={`tel:${company.phone}`}
                  className="bg-black text-white px-4 py-2 rounded text-sm hover:opacity-90"
                >
                  Call
                </a>
              )}

              {company.email && (
                <a
                  href={`mailto:${company.email}?subject=Enquiry about ${product.name}`}
                  className="border px-4 py-2 rounded text-sm hover:bg-gray-100"
                >
                  Email
                </a>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}