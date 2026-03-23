import { PDFDocument, StandardFonts } from 'pdf-lib'

export const runtime = 'nodejs'

export async function POST(req: Request) {

  const { products } = await req.json()

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const page = pdfDoc.addPage([595, 842])

  let y = 800

  for (const p of products) {

    page.drawText(p.name || 'Test Product', {
      x: 50,
      y,
      size: 12,
      font,
    })

    y -= 20

    page.drawText(`₹ ${p.base_price ?? '-'}`, {
      x: 50,
      y,
      size: 10,
      font,
    })

    y -= 30
  }

  const pdfBytes = await pdfDoc.save()

  // ✅ CRITICAL FIX
  return new Response(pdfBytes as any, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(pdfBytes.length),
      'Content-Disposition': 'attachment; filename="catalog.pdf"',
    },
  })
}