import PDFDocument from 'pdfkit'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {

  const { products, attributes } = await req.json()

  const doc = new PDFDocument({ size: 'A4', margin: 20 })

  const chunks: any[] = []
  doc.on('data', chunk => chunks.push(chunk))

  let x = 20
  let y = 20

  const cardWidth = 260
  const cardHeight = 300

  for (let i = 0; i < products.length; i++) {

    const p = products[i]

    try {
      const img = await fetch(p.product_images?.[0]?.image_url)
      const buffer = Buffer.from(await img.arrayBuffer())

      doc.image(buffer, x, y, {
        fit: [cardWidth, 200]
      })
    } catch {}

    doc.fontSize(10).text(p.name, x, y + 210)

    if (attributes?.length) {
      doc.fontSize(9).text(attributes.join(' | '), x, y + 230)
    }

    doc.fontSize(12).text(`₹ ${p.base_price ?? '-'}`, x, y + 250)

    if (x === 20) x = 300
    else {
      x = 20
      y += cardHeight
    }

    if (y > 750) {
      doc.addPage()
      x = 20
      y = 20
    }
  }

  doc.end()

  const buffer = await new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))
  })

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=catalog.pdf'
    }
  })
}