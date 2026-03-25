import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { gstin } = req.query;

  if (!gstin || typeof gstin !== "string") {
    return res.status(400).json({ error: "GSTIN required" });
  }

  try {
    const response = await fetch(
      `https://appyflow.in/api/verifyGST?gstin=${gstin}`,
      {
        method: "GET",
        headers: {
          "X-API-KEY": process.env.APPYFLOW_KEY as string,
        },
      }
    );

    const data = await response.json();

    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}