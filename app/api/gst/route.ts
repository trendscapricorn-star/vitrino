export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const gstin = searchParams.get("gstin")

  if (!gstin) {
    return Response.json({ error: "GSTIN required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://appyflow.in/api/verifyGST?gstNo=${gstin}&key_secret=${process.env.APPYFLOW_KEY}`,
      {
        method: "GET",
      }
    )

    const data = await response.json()

    return Response.json(data)
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}