import { PDFDocument, StandardFonts } from 'pdf-lib'

export const runtime = 'nodejs'

export async function POST(req: Request) {

  const { products = [] } = await req.json()

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  let page = pdfDoc.addPage([595, 842])
  const pageWidth = 595

  const margin = 30
  const cardWidth = (pageWidth - margin * 3) / 2

  let x = margin
  let y = 800

  for (let i = 0; i < products.length; i++) {

    const p = products[i]

    // 🖼️ IMAGE
    try {
      if (p.product_images?.[0]?.image_url) {

        const res = await fetch(p.product_images[0].image_url)
        const imgBytes = await res.arrayBuffer()

        const img = await pdfDoc.embedJpg(imgBytes).catch(() =>
          pdfDoc.embedPng(imgBytes)
        )

        const dims = img.scale(0.5)

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

    // ➡️ POSITIONING
    if (x === margin) {
      x = margin * 2 + cardWidth
    } else {
      x = margin
      y -= 180
    }

    // 📄 NEW PAGE
    if (y < 100) {
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
}