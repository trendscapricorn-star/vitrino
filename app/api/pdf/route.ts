import { PDFDocument, StandardFonts } from 'pdf-lib'

export const runtime = 'nodejs'

export async function POST(req: Request) {

  const { products = [] } = await req.json()

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 595
  const pageHeight = 300
  const margin = 30

  const cardWidth = (pageWidth - margin * 3) / 2
  const totalPages = Math.ceil(products.length / 2)

  for (let i = 0; i < products.length; i += 2) {

    const pageIndex = Math.floor(i / 2) + 1
    const page = pdfDoc.addPage([pageWidth, pageHeight])

    let x = margin
    let y = pageHeight - 20

    for (let j = 0; j < 2; j++) {

      const p = products[i + j]
      if (!p) continue

      // 🖼️ IMAGE (SHARP FIX)
      try {
        if (p.product_images?.[0]?.image_url) {

          const res = await fetch(p.product_images[0].image_url)
          const imgBytes = await res.arrayBuffer()

          const img = await pdfDoc.embedJpg(imgBytes).catch(() =>
            pdfDoc.embedPng(imgBytes)
          )

          // 🔥 maintain aspect ratio
          const imgWidth = img.width
          const imgHeight = img.height

          const ratio = Math.min(
            cardWidth / imgWidth,
            170 / imgHeight
          )

          const drawWidth = imgWidth * ratio
          const drawHeight = imgHeight * ratio

          page.drawImage(img, {
            x,
            y: y - drawHeight,
            width: drawWidth,
            height: drawHeight,
          })

          // 🏷️ TEXT BELOW IMAGE
          const textY = y - drawHeight - 12

          page.drawText(p.name || '', {
            x,
            y: textY,
            size: 11,
            font: boldFont,
          })

          page.drawText(`Rs. ${p.base_price ?? '-'}`, {
            x,
            y: textY - 14,
            size: 11,
            font,
          })
        }
      } catch {}

      // ➡️ next column
      x = margin * 2 + cardWidth
    }

    // 🔢 PAGE NUMBER
    page.drawText(`${pageIndex} / ${totalPages}`, {
      x: pageWidth / 2 - 15,
      y: 8,
      size: 10,
      font,
    })
  }

  const pdfBytes = await pdfDoc.save()

  return new Response(new Uint8Array(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
    },
  })
}