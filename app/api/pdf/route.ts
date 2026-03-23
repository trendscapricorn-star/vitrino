import PDFDocument from 'pdfkit'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {

  const { products, config } = await req.json()

  const doc = new PDFDocument({ size: 'A4', margin: 40 })

  const chunks: any[] = []

  const stream = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })

  let y = 40

  for (const p of products) {

    if (config?.includeName) {
      doc.fontSize(12).text(p.name || '', 40, y)
      y += 20
    }

    if (config?.includePrice) {
      doc.fontSize(10).text(`₹ ${p.base_price ?? '-'}`, 40, y)
      y += 20
    }

    y += 20

    if (y > 750) {
      doc.addPage()
      y = 40
    }
  }

  doc.end()

  const buffer = await stream

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=test.pdf'
    }
  })
}