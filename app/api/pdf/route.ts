import PDFDocument from 'pdfkit'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {

  const { products, attributes, config } = await req.json()

  const doc = new PDFDocument({
    size: 'A4',
    margin: 20
  })

  const chunks: any[] = []

  // ✅ FIX: attach listeners BEFORE doc.end()
  const bufferPromise = new Promise<Buffer>((resolve, reject) => {

    doc.on('data', (chunk) => chunks.push(chunk))

    doc.on('end', () => {
      resolve(Buffer.concat(chunks))
    })

    doc.on('error', reject)
  })

  let x = 20
  let y = 20

  const cardWidth = 260
  const cardHeight = 280

  for (let i = 0; i < products.length; i++) {

    const p = products[i]

    // 🖼️ IMAGE
    try {
      const img = await fetch(p.product_images?.[0]?.image_url)
      const buffer = Buffer.from(await img.arrayBuffer())

      doc.image(buffer, x, y, {
        fit: [cardWidth, 180],
        align: 'center'
      })
    } catch (err) {
      // ignore image errors
    }

    let textY = y + 190

    // 🏷️ NAME
    if (config?.includeName) {
      doc
        .fontSize(10)
        .text(p.name || '', x, textY, { width: cardWidth })
      textY += 15
    }

    // 🧾 ATTRIBUTES
    if (config?.includeAttributes && attributes?.length) {
      doc
        .fontSize(9)
        .fillColor('gray')
        .text(attributes.join(' | '), x, textY, { width: cardWidth })
      doc.fillColor('black')
      textY += 15
    }

    // 💰 PRICE
    if (config?.includePrice) {
      doc
        .fontSize(12)
        .text(`₹ ${p.base_price ?? '-'}`, x, textY)
    }

    // ➡️ NEXT POSITION
    if (x === 20) {
      x = 300
    } else {
      x = 20
      y += cardHeight
    }

    // 📄 NEW PAGE
    if (y > 750) {
      doc.addPage()
      x = 20
      y = 20
    }
  }

  // ✅ IMPORTANT: end AFTER loop
  doc.end()

  // ✅ wait for full buffer
  const buffer = await bufferPromise

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=catalog.pdf'
    }
  })
}