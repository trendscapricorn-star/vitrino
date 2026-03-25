import { PDFDocument, StandardFonts } from 'pdf-lib'

export const runtime = 'nodejs'

export async function POST(req: Request) {

  const { products = [], config = {} } = await req.json()

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // ✅ FULL BLEED PAGE
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

      // 🖼️ LOAD IMAGE ONCE
      let img
      try {
        if (p.product_images?.[0]?.image_url) {
          const res = await fetch(p.product_images[0].image_url)
          const imgBytes = await res.arrayBuffer()

          img = await pdfDoc.embedJpg(imgBytes).catch(() =>
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

      // 🧠 TEXT CALCULATION
      let estimatedTextHeight = 0

      const design = p.design_no || p.name || ''
      const priceText = `Rs. ${p.base_price ?? '-'}`

      estimatedTextHeight += 13 + 14 // design + price

      let values: string[] = []
      if (config?.includeAttributes && p.product_attribute_values?.length) {
        values = p.product_attribute_values
          .map((av: any) => av.attribute_options?.value)
          .filter(Boolean)

        estimatedTextHeight += Math.ceil(values.length / 3) * 11
      }

      if (config?.includeName) estimatedTextHeight += 14

      const totalBlockHeight = drawHeight + 6 + estimatedTextHeight

      // ✅ PERFECT CENTER
      let y = contentBottom + (contentHeight + totalBlockHeight) / 2

      // 🖼️ DRAW IMAGE
      if (img) {
        page.drawImage(img, {
          x: imageX,
          y: y - drawHeight,
          width: drawWidth,
          height: drawHeight,
        })
      }

      let textY = y - drawHeight - 6

      // 🔥 DESIGN NO (TRUE CENTER)
      const designWidth = boldFont.widthOfTextAtSize(design, 11)
      page.drawText(design, {
        x: x + (columnWidth - designWidth) / 2,
        y: textY,
        size: 11,
        font: boldFont,
      })

      textY -= 13

      // 🔥 PRICE (TRUE CENTER)
      const priceWidth = boldFont.widthOfTextAtSize(priceText, 11)
      page.drawText(priceText, {
        x: x + (columnWidth - priceWidth) / 2,
        y: textY,
        size: 11,
        font: boldFont,
      })

      textY -= 14

      // 🏷️ NAME
      if (config?.includeName) {
        const name = p.name || ''
        const nameWidth = boldFont.widthOfTextAtSize(name, 12)

        page.drawText(name, {
          x: x + (columnWidth - nameWidth) / 2,
          y: textY,
          size: 12,
          font: boldFont,
        })

        textY -= 14
      }

      // 🧾 ATTRIBUTES
      if (values.length) {
        for (let k = 0; k < values.length; k += 3) {

          const line = values.slice(k, k + 3).join(' | ')
          const lineWidth = font.widthOfTextAtSize(line, 9)

          page.drawText(line, {
            x: x + (columnWidth - lineWidth) / 2,
            y: textY,
            size: 9,
            font,
          })

          textY -= 11
        }
      }

      // ➡️ NEXT COLUMN
      x = columnWidth
    }

    // 🔢 PAGE NUMBER
    const pageText = `${pageIndex} / ${totalPages}`
    const pageTextWidth = font.widthOfTextAtSize(pageText, 9)

    page.drawText(pageText, {
      x: (pageWidth - pageTextWidth) / 2,
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