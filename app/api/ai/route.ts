import { NextResponse } from "next/server"
import { Buffer } from "buffer"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

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

async function imageToBase64(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch image")

  const buffer = await res.arrayBuffer()
  return Buffer.from(buffer).toString("base64")
}

export async function POST(req: Request) {
  try {
    // ================================
    // SUPABASE AUTH CHECK
    // ================================
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // ================================
    // REQUEST BODY
    // ================================
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

    let prompt = ""

    // =============================
    // ATTRIBUTE SUGGESTION
    // =============================
    if (mode === "attribute_suggestion") {
      prompt = `
You are a product taxonomy expert.

Return ONLY valid JSON.

Format:
{
  "suggested_attributes": [
    { "name": "", "options": [] }
  ]
}

Category: ${category}

Existing Attributes:
${JSON.stringify(existingAttributes, null, 2)}
`
    }

    // =============================
    // PRODUCT AUTO FILL
    // =============================
    if (mode === "product_autofill") {
      prompt = `
You are a strict product classification AI.

Return ONLY valid JSON.

Format:
{
  "moderation": { "allowed": true, "reason": "" },
  "matched_attributes": [
    { "attribute_name": "", "matched_option": "" }
  ],
  "new_option_suggestions": [
    { "attribute_name": "", "suggested_option": "" }
  ]
}

Rules:
- Only match attribute_name from provided list.
- Only match matched_option from provided options.
- If highly confident.
- If unsure, skip.
- Never hallucinate.

Category: ${category}

Existing Attributes:
${JSON.stringify(existingAttributes, null, 2)}

Product Name: ${productName || ""}
Description: ${description || ""}
`
    }

    let parts: any[] = [{ text: prompt }]

    if (mode === "product_autofill" && imageUrl) {
      const base64Image = await imageToBase64(imageUrl)

      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts,
            },
          ],
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error("Gemini Error:", result)
      return NextResponse.json(
        { error: "Gemini failed", message: result },
        { status: 500 }
      )
    }

    const text =
      result?.candidates?.[0]?.content?.parts?.[0]?.text || ""

    const parsed = extractJSON(text)

    if (mode === "attribute_suggestion") {
      return NextResponse.json(parsed || { suggested_attributes: [] })
    }

    return NextResponse.json(
      parsed || {
        moderation: { allowed: true, reason: "" },
        matched_attributes: [],
        new_option_suggestions: [],
      }
    )
  } catch (err: any) {
    console.error("AI FULL ERROR:", err)

    return NextResponse.json(
      { error: "AI failed", message: err?.message || "Unknown error" },
      { status: 500 }
    )
  }
}