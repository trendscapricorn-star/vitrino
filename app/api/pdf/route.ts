import PDFDocument from 'pdfkit'

export const runtime = 'nodejs'

export async function GET() {

  const doc = new PDFDocument()

  const stream = new ReadableStream({
    start(controller) {

      doc.on('data', chunk => controller.enqueue(chunk))
      doc.on('end', () => controller.close())
      doc.on('error', err => controller.error(err))

      // ✅ SIMPLE TEST CONTENT
      doc.fontSize(20).text('PDF TEST WORKING', 100, 100)

      doc.end()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/pdf',
    }
  })
}