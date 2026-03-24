import { PDFDocument, StandardFonts } from 'pdf-lib'

export const runtime = 'nodejs'

export async function POST(req: Request) {

  const { products = [] } = await req.json()

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const pageWidth = 595
  const pageHeight = 300 // ✅ only enough for 1 row
  const margin = 30

  const cardWidth = (pageWidth - margin * 3) / 2

  for (let i = 0; i < products.length; i += 2) {

    const page = pdfDoc.addPage([pageWidth, pageHeight])

    let x = margin
    let y = pageHeight - margin

    for (let j = 0; j < 2; j++) {

      const p = products[i + j]
      if (!p) continue

      // 🖼️ IMAGE
      try {
        if (p.product_images?.[0]?.image_url) {

          const res = await fetch(p.product_images[0].image_url)
          const imgBytes = await res.arrayBuffer()

          const img = await pdfDoc.embedJpg(imgBytes).catch(() =>
            pdfDoc.embedPng(imgBytes)
          )

          page.drawImage(img, {
            x,
            y: y - 120,
            width: cardWidth,
            height: 120,
          })
        }
      } catch {}

      // 🏷️ NAME
      page.drawText(p.name || '', {
        x,
        y: y - 135,
        size: 10,
        font,
        maxWidth: cardWidth
      })

      // 💰 PRICE
      page.drawText(`Rs. ${p.base_price ?? '-'}`, {
        x,
        y: y - 150,
        size: 10,
        font,
      })

      // ➡️ move to right column
      x = margin * 2 + cardWidth
    }
  }

  const pdfBytes = await pdfDoc.save()

  return new Response(new Uint8Array(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
    },
  })
}