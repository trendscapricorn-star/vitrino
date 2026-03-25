export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const gstin = searchParams.get("gstin")

  if (!gstin) {
    return Response.json({ error: "GSTIN required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://appyflow.in/api/verifyGST?gstin=${gstin}`,
      {
        method: "GET",
        headers: {
          "X-API-KEY": process.env.APPYFLOW_KEY!,
        },
      }
    )

    const data = await response.json()

    return Response.json(data)
  } catch (err: any) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    )
  }
}