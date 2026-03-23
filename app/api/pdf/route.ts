import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export const runtime = 'nodejs'

export async function POST(req: Request) {

  const { products, config } = await req.json()

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  let page = pdfDoc.addPage([595, 842]) // A4
  let { width, height } = page.getSize()

  let y = height - 40

  for (const p of products) {

    // 🏷️ NAME
    if (config?.includeName) {
      page.drawText(p.name || '', {
        x: 40,
        y,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      })
      y -= 20
    }

    // 💰 PRICE
    if (config?.includePrice) {
      page.drawText(`₹ ${p.base_price ?? '-'}`, {
        x: 40,
        y,
        size: 10,
        font,
      })
      y -= 20
    }

    y -= 20

    // 📄 NEW PAGE
    if (y < 50) {
      page = pdfDoc.addPage([595, 842])
      y = height - 40
    }
  }

  const pdfBytes = await pdfDoc.save()

  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=catalog.pdf',
    },
  })
}