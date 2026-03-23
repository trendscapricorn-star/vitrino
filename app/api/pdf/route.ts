import PDFDocument from 'pdfkit'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {

  const { products, config } = await req.json()

  const doc = new PDFDocument({
    size: 'A4', // base size (we will scroll vertically)
    margin: 30
  })

  const chunks: any[] = []

  const stream = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })

  let y = 30

  for (const p of products) {

    // 🖼️ IMAGE (SAFE LOAD)
    let imageHeight = 200

    try {
      if (p.product_images?.[0]?.image_url) {

        const res = await fetch(p.product_images[0].image_url)
        const arrayBuffer = await res.arrayBuffer()
        const imgBuffer = Buffer.from(arrayBuffer)

        doc.image(imgBuffer, 30, y, {
          fit: [520, 200],
          align: 'center'
        })

        imageHeight = 200
      }
    } catch (e) {
      // ignore image errors
    }

    y += imageHeight + 10

    // 🏷️ NAME
    if (config?.includeName) {
      doc.fontSize(12).text(p.name || '', 30, y, {
        width: 520
      })
      y += 20
    }

    // 💰 PRICE
    if (config?.includePrice) {
      doc.fontSize(11).text(`₹ ${p.base_price ?? '-'}`, 30, y)
      y += 20
    }

    y += 20

    // 📄 AUTO NEW PAGE
    if (y > 750) {
      doc.addPage()
      y = 30
    }
  }

  doc.end()

  const buffer = await stream

  // ✅ FIX TYPE ERROR HERE
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=catalog.pdf'
    }
  })
}