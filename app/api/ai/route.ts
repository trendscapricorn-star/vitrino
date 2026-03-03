import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
)

function extractJSON(text: string) {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()

    const firstBrace = cleaned.indexOf("{")
    const lastBrace = cleaned.lastIndexOf("}")

    if (firstBrace === -1 || lastBrace === -1) return null

    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1))
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      mode,
      category,
      existingAttributes,
      imageUrl,
      productName,
      description,
    } = body

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    let prompt = ""

    // =============================
    // MODE 1: ATTRIBUTE SUGGESTION
    // =============================
    if (mode === "attribute_suggestion") {
      prompt = `
You are a product taxonomy expert.

Return ONLY valid JSON.

Format:
{
  "suggested_attributes": [
    {
      "name": "",
      "options": []
    }
  ]
}

Rules:
- Do not repeat existing attributes.
- Suggest only highly relevant attributes.
- Keep suggestions minimal and filter-friendly.

Category: ${category}

Existing Attributes:
${JSON.stringify(existingAttributes, null, 2)}
`
      const result = await model.generateContent(prompt)
      const parsed = extractJSON(result.response.text())

      return NextResponse.json(parsed || { suggested_attributes: [] })
    }

    // =============================
    // MODE 2: PRODUCT AUTO FILL
    // =============================
    if (mode === "product_autofill") {
      if (!imageUrl) {
        return NextResponse.json(
          { error: "Image required" },
          { status: 400 }
        )
      }

      const imageBuffer = await fetch(imageUrl).then(r => r.arrayBuffer())
      const base64Image = Buffer.from(imageBuffer).toString("base64")

      prompt = `
You are a strict product classification AI.

Return ONLY valid JSON.

Format:
{
  "moderation": {
    "allowed": true,
    "reason": ""
  },
  "matched_attributes": [
    {
      "attribute_name": "",
      "matched_option": ""
    }
  ],
  "new_option_suggestions": [
    {
      "attribute_name": "",
      "suggested_option": ""
    }
  ]
}

Rules:
- Only match attribute_name from provided list.
- Only match matched_option from provided options.
- If highly confident.
- If unsure, skip.

Category: ${category}

Existing Attributes:
${JSON.stringify(existingAttributes, null, 2)}

Product Name: ${productName || ""}
Description: ${description || ""}
`

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image,
          },
        },
      ])

      const parsed = extractJSON(result.response.text())

      return NextResponse.json(
        parsed || {
          moderation: { allowed: true, reason: "" },
          matched_attributes: [],
          new_option_suggestions: [],
        }
      )
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
  } catch (err) {
    console.error("AI Error:", err)
    return NextResponse.json({ error: "AI failed" }, { status: 500 })
  }
}