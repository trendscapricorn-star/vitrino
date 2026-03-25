import { PDFDocument, StandardFonts } from 'pdf-lib'

export const runtime = 'nodejs'

export async function POST(req: Request) {

  const { products = [], config = {} } = await req.json()

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // ✅ FULL BLEED PAGE (NO MARGINS)
  const pageWidth = 595
  const pageHeight = 380

  const columnWidth = pageWidth / 2

  const contentTop = pageHeight - 10
  const contentBottom = 10
  const contentHeight = contentTop - contentBottom

  const totalPages = Math.ceil(products.length / 2)

  for (let i = 0; i < products.length; i += 2) {

    const pageIndex = Math.floor(i / 2) + 1
    const page = pdfDoc.addPage([pageWidth, pageHeight])

    let x = 0

    for (let j = 0; j < 2; j++) {

      const p = products[i + j]
      if (!p) continue

      let drawWidth = columnWidth
      let drawHeight = 200

      let imageX = x

      // 🖼️ IMAGE LOAD
      try {
        if (p.product_images?.[0]?.image_url) {

          const res = await fetch(p.product_images[0].image_url)
          const imgBytes = await res.arrayBuffer()

          const img = await pdfDoc.embedJpg(imgBytes).catch(() =>
            pdfDoc.embedPng(imgBytes)
          )

          const imgW = img.width
          const imgH = img.height

          const maxWidth = columnWidth * 0.95
          const maxHeight = 250

          const ratio = Math.min(maxWidth / imgW, maxHeight / imgH)

          drawWidth = imgW * ratio
          drawHeight = imgH * ratio

          imageX = x + (columnWidth - drawWidth) / 2
        }
      } catch {}

      // 🧠 CALCULATE TEXT HEIGHT
      let estimatedTextHeight = 0

      if (config?.includeName) estimatedTextHeight += 14

      let attrLines = 0
      let values: string[] = []

      if (config?.includeAttributes && p.product_attribute_values?.length) {
        values = p.product_attribute_values
          .map((av: any) => av.attribute_options?.value)
          .filter(Boolean)

        attrLines = Math.ceil(values.length / 3)
        estimatedTextHeight += attrLines * 11
      }

      if (config?.includePrice) estimatedTextHeight += 13

      const totalBlockHeight = drawHeight + 6 + estimatedTextHeight

      // 🔥 PERFECT VERTICAL CENTERING
      let y = contentBottom + (contentHeight + totalBlockHeight) / 2

      // 🖼️ DRAW IMAGE
      try {
        if (p.product_images?.[0]?.image_url) {
          const res = await fetch(p.product_images[0].image_url)
          const imgBytes = await res.arrayBuffer()

          const img = await pdfDoc.embedJpg(imgBytes).catch(() =>
            pdfDoc.embedPng(imgBytes)
          )

          page.drawImage(img, {
            x: imageX,
            y: y - drawHeight,
            width: drawWidth,
            height: drawHeight,
          })
        }
      } catch {}

      // ✍️ TEXT START
      let textY = y - drawHeight - 6
      const centerX = x + columnWidth / 2

      // 🏷️ NAME
      if (config?.includeName) {
        page.drawText(p.name || '', {
          x: centerX,
          y: textY,
          size: 12,
          font: boldFont,
          maxWidth: columnWidth,
          align: 'center',
        })
        textY -= 14
      }

      // 🧾 ATTRIBUTES (3 PER LINE)
      if (config?.includeAttributes && values.length) {

        for (let k = 0; k < values.length; k += 3) {

          const line = values.slice(k, k + 3).join(' | ')

          page.drawText(line, {
            x: centerX,
            y: textY,
            size: 9,
            font,
            maxWidth: columnWidth,
            align: 'center',
          })

          textY -= 11
        }
      }

      // 💰 PRICE
      if (config?.includePrice) {
        page.drawText(`Rs. ${p.base_price ?? '-'}`, {
          x: centerX,
          y: textY,
          size: 12,
          font: boldFont,
        })
      }

      // ➡️ NEXT COLUMN
      x = columnWidth
    }

    // 🔢 PAGE NUMBER (very bottom center)
    page.drawText(`${pageIndex} / ${totalPages}`, {
      x: pageWidth / 2 - 15,
      y: 4,
      size: 9,
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