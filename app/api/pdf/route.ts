import { PDFDocument, StandardFonts } from 'pdf-lib'

export const runtime = 'nodejs'

export async function POST(req: Request) {

  const { products = [], config = {}, attributes = [] } = await req.json()

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 595
  const pageHeight = 320
  const margin = 30

  const totalPages = Math.ceil(products.length / 2)

  for (let i = 0; i < products.length; i += 2) {

    const pageIndex = Math.floor(i / 2) + 1
    const page = pdfDoc.addPage([pageWidth, pageHeight])

    let x = margin
    let y = pageHeight - 20

    for (let j = 0; j < 2; j++) {

      const p = products[i + j]
      if (!p) continue

      let drawWidth = 240
      let drawHeight = 160

      // 🖼️ IMAGE WITH AUTO WIDTH FIT
      try {
        if (p.product_images?.[0]?.image_url) {

          const res = await fetch(p.product_images[0].image_url)
          const imgBytes = await res.arrayBuffer()

          const img = await pdfDoc.embedJpg(imgBytes).catch(() =>
            pdfDoc.embedPng(imgBytes)
          )

          const imgW = img.width
          const imgH = img.height

          // 🔥 auto scale (fit inside half page)
          const maxWidth = (pageWidth - margin * 3) / 2
          const maxHeight = 170

          const ratio = Math.min(maxWidth / imgW, maxHeight / imgH)

          drawWidth = imgW * ratio
          drawHeight = imgH * ratio

          // center image inside column
          const offsetX = (maxWidth - drawWidth) / 2

          page.drawImage(img, {
            x: x + offsetX,
            y: y - drawHeight,
            width: drawWidth,
            height: drawHeight,
          })
        }
      } catch {}

      let textY = y - drawHeight - 12

      // 🏷️ NAME
      if (config?.includeName) {
        page.drawText(p.name || '', {
          x,
          y: textY,
          size: 11,
          font: boldFont,
        })
        textY -= 14
      }

      // 🧾 ATTRIBUTES
      if (config?.includeAttributes && attributes.length) {
        page.drawText(attributes.join(' | '), {
          x,
          y: textY,
          size: 9,
          font,
        })
        textY -= 12
      }

      // 💰 PRICE
      if (config?.includePrice) {
        page.drawText(`Rs. ${p.base_price ?? '-'}`, {
          x,
          y: textY,
          size: 11,
          font,
        })
      }

      // ➡️ next column
      x = margin * 2 + (pageWidth - margin * 3) / 2
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