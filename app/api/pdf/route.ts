import { PDFDocument, StandardFonts } from 'pdf-lib'

export const runtime = 'nodejs'

export async function POST(req: Request) {

  try {

    const body = await req.json()

    console.log('PDF BODY:', body) // 👈 ADD THIS

    const products = body.products || []

    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    let page = pdfDoc.addPage([595, 842])
    let y = 800

    for (const p of products) {

      page.drawText(String(p?.name || 'Product'), {
        x: 40,
        y,
        size: 12,
        font,
      })

      y -= 20

      page.drawText(`₹ ${p?.base_price ?? '-'}`, {
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

    return new Response(new Uint8Array(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
      },
    })

  } catch (err: any) {

    console.error('PDF ERROR FULL:', err) // 👈 IMPORTANT

    return new Response(
      JSON.stringify({ error: err?.message || 'PDF failed' }),
      { status: 500 }
    )
  }
}