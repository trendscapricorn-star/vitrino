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

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    let prompt = ""

    // =============================
    // ATTRIBUTE SUGGESTION MODE
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
- Keep suggestions minimal.

Category: ${category}

Existing Attributes:
${JSON.stringify(existingAttributes, null, 2)}
`

      const result = await model.generateContent(prompt)
      const parsed = extractJSON(result.response.text())

      return NextResponse.json(
        parsed || { suggested_attributes: [] }
      )
    }

    // =============================
    // PRODUCT AUTO FILL MODE
    // =============================
    if (mode === "product_autofill") {
      if (!imageUrl) {
        return NextResponse.json(
          { error: "Image required" },
          { status: 400 }
        )
      }

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
- Do not hallucinate.

Category: ${category}

Existing Attributes:
${JSON.stringify(existingAttributes, null, 2)}

Product Name: ${productName || ""}
Description: ${description || ""}
`

      const result = await model.generateContent([
        prompt,
        {
          fileData: {
            mimeType: "image/jpeg",
            fileUri: imageUrl,
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

    return NextResponse.json(
      { error: "Invalid mode" },
      { status: 400 }
    )
  } catch (err: any) {
    console.error("AI FULL ERROR:", err)

    return NextResponse.json(
      {
        error: "AI failed",
        message: err?.message || "Unknown server error"
      },
      { status: 500 }
    )
  }
}