import { PDFDocument, StandardFonts } from 'pdf-lib'

export const runtime = 'nodejs'

export async function POST(req: Request) {

  const { products = [], config = {} } = await req.json()

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 595
  const pageHeight = 320
  const margin = 30

  const columnWidth = (pageWidth - margin * 3) / 2
  const totalPages = Math.ceil(products.length / 2)

  for (let i = 0; i < products.length; i += 2) {

    const pageIndex = Math.floor(i / 2) + 1
    const page = pdfDoc.addPage([pageWidth, pageHeight])

    let x = margin
    let y = pageHeight - 20

    for (let j = 0; j < 2; j++) {

      const p = products[i + j]
      if (!p) continue

      let drawWidth = columnWidth
      let drawHeight = 160

      let imageX = x

      // 🖼️ IMAGE
      try {
        if (p.product_images?.[0]?.image_url) {

          const res = await fetch(p.product_images[0].image_url)
          const imgBytes = await res.arrayBuffer()

          const img = await pdfDoc.embedJpg(imgBytes).catch(() =>
            pdfDoc.embedPng(imgBytes)
          )

          const imgW = img.width
          const imgH = img.height

          const maxWidth = columnWidth
          const maxHeight = 170

          const ratio = Math.min(maxWidth / imgW, maxHeight / imgH)

          drawWidth = imgW * ratio
          drawHeight = imgH * ratio

          // ✅ center image
          imageX = x + (columnWidth - drawWidth) / 2

          page.drawImage(img, {
            x: imageX,
            y: y - drawHeight,
            width: drawWidth,
            height: drawHeight,
          })
        }
      } catch {}

      let textY = y - drawHeight - 10

      // ✅ CENTER TEXT WITH IMAGE
      const textX = imageX

      // 🏷️ NAME
      if (config?.includeName) {
        page.drawText(p.name || '', {
          x: textX,
          y: textY,
          size: 11,
          font: boldFont,
        })
        textY -= 14
      }

      // 🧾 ATTRIBUTE VALUES (FIXED)
      if (config?.includeAttributes && p.product_attribute_values?.length) {

        const values = p.product_attribute_values
          .map((av: any) => av.attribute_options?.value)
          .filter(Boolean)

        if (values.length) {
          page.drawText(values.join(' | '), {
            x: textX,
            y: textY,
            size: 9,
            font,
          })
          textY -= 12
        }
      }

      // 💰 PRICE
      if (config?.includePrice) {
        page.drawText(`Rs. ${p.base_price ?? '-'}`, {
          x: textX,
          y: textY,
          size: 11,
          font,
        })
      }

      // ➡️ next column
      x = margin * 2 + columnWidth
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