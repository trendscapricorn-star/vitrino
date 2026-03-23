import { PDFDocument, StandardFonts } from 'pdf-lib'

export const runtime = 'nodejs'

export async function POST(req: Request) {

  try {

    const body = await req.json()
    const products = body.products || []

    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    let page = pdfDoc.addPage([595, 842])
    let y = 800

    for (const p of products) {

      const name = p?.name || 'Product'
      const price = p?.base_price ?? '-'

      page.drawText(name, {
        x: 40,
        y,
        size: 12,
        font,
      })

      y -= 20

      page.drawText(`₹ ${price}`, {
        x: 40,
        y,
        size: 10,
        font,
      })

      y -= 30

      if (y < 50) {
        page = pdfDoc.addPage([595, 842])
        y = 800
      }
    }

    const pdfBytes = await pdfDoc.save()

    // ✅ CRITICAL FIX (NO TYPE ISSUE)
    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="catalog.pdf"',
      },
    })

  } catch (err) {

    console.error('PDF ERROR:', err)

    return new Response(
      JSON.stringify({ error: 'PDF failed' }),
      { status: 500 }
    )
  }
}