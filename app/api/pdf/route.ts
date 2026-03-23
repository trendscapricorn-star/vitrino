import PDFDocument from 'pdfkit'

export const runtime = 'nodejs'

export async function POST(req: Request) {

  const { products, config } = await req.json()

  const doc = new PDFDocument({
    size: 'A4',
    margin: 30
  })

  // ✅ Create stream
  const stream = new ReadableStream({
    start(controller) {

      doc.on('data', (chunk) => {
        controller.enqueue(chunk)
      })

      doc.on('end', () => {
        controller.close()
      })

      doc.on('error', (err) => {
        controller.error(err)
      })

      let y = 30

      for (const p of products) {

        // TEXT ONLY (no image for now — stable)
        if (config?.includeName) {
          doc.fontSize(12).text(p.name || '', 30, y)
          y += 20
        }

        if (config?.includePrice) {
          doc.fontSize(11).text(`₹ ${p.base_price ?? '-'}`, 30, y)
          y += 20
        }

        y += 20

        if (y > 750) {
          doc.addPage()
          y = 30
        }
      }

      doc.end()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=catalog.pdf'
    }
  })
}