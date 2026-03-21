import { NextResponse } from "next/server"
import { Buffer } from "buffer"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

/* ---------------- JSON EXTRACT ---------------- */

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

/* ---------------- IMAGE TO BASE64 ---------------- */

async function imageToBase64(url: string) {
  if (url.startsWith("data:image")) {
    return url.split(",")[1]
  }

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error("Failed to fetch image")
  }

  const buffer = await res.arrayBuffer()
  return Buffer.from(buffer).toString("base64")
}

/* ---------------- MAIN ---------------- */

export async function POST(req: Request) {
  try {
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

    

    const body = await req.json()

    const {
      mode,
      category,
      existingAttributes,
      imageUrl,
      productName,
      description,
      query,
    } = body

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      )
    }

    let prompt = ""

    /* ============================= */
    /* ATTRIBUTE SUGGESTION */
    /* ============================= */
    if (mode === "attribute_suggestion") {
      prompt = `
Return ONLY JSON:

{
  "suggested_attributes": [
    { "name": "", "options": [] }
  ]
}

Category: ${category}
Existing: ${JSON.stringify(existingAttributes)}
`
    }

    /* ============================= */
    /* ✅ PRODUCT AUTO FILL (STRICT FIX) */
    /* ============================= */
    else if (mode === "product_autofill") {

      const simplifiedAttributes = (existingAttributes || [])
        .map((attr: any) => {
          const optionsArray = attr.options || []

          if (!optionsArray.length) return null

          const options = optionsArray
            .map((o: any, i: number) => `${i + 1}. ${o.value}`)
            .join("\n")

          return `ATTRIBUTE ID: ${attr.id}
ATTRIBUTE NAME: ${attr.name}

OPTIONS (choose EXACTLY one):
${options}`
        })
        .filter(Boolean)
        .join("\n\n")

      if (!simplifiedAttributes) {
        return NextResponse.json({ matched_attributes: [] })
      }

      prompt = `
You are a STRICT product attribute selector.

Return ONLY JSON:

{
  "matched_attributes": [
    {
      "attribute_id": "",
      "selected_option": ""
    }
  ]
}

RULES:

1. You MUST choose ONLY from the given options
2. You MUST return EXACT option text
3. DO NOT create new values
4. DO NOT modify options
5. ALWAYS return one option per attribute
6. If unsure, choose the closest available option
7. NEVER return empty matched_attributes

IMPORTANT:
Use IMAGE as primary source.

INPUT:
Category: ${category}

${simplifiedAttributes}

Name: ${productName || ""}
Description: ${description || ""}
`
    }

    /* ============================= */
    /* SEARCH PARSER */
    /* ============================= */
    else if (mode === "search_parse") {
      prompt = `
Return ONLY JSON:

{
  "search": "main keyword",
  "tags": [],
  "city": null
}

Query: ${query}
`
    }

    /* ============================= */
    /* KEYWORD GENERATOR */
    /* ============================= */
    else if (mode === "keyword_generate") {
      prompt = `
Return ONLY JSON:

{
  "tags": [],
  "tags_text": ""
}

Business Description:
${description}
`
    }

    /* ============================= */
    /* GEMINI REQUEST */
    /* ============================= */

    let parts: any[] = [{ text: prompt }]

    if (mode === "product_autofill" && imageUrl) {
      const base64Image = await imageToBase64(imageUrl)

      parts.push({
        inlineData: {
          mimeType: "image/*",
          data: base64Image,
        },
      })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
        }),
      }
    )

    const result = await response.json()

    const text =
  result?.candidates?.[0]?.content?.parts?.[0]?.text || ""

console.log("RAW AI TEXT:", text)

const parsed = extractJSON(text)

console.log("PARSED JSON:", parsed)

    if (mode === "keyword_generate") {
      return NextResponse.json(
        parsed || { tags: [], tags_text: "" }
      )
    }

    if (mode === "search_parse") {
      return NextResponse.json(
        parsed || { search: query, tags: [], city: null }
      )
    }

    if (mode === "attribute_suggestion") {
      return NextResponse.json(parsed || { suggested_attributes: [] })
    }

    return NextResponse.json(
      parsed || { matched_attributes: [] }
    )

  } catch (err: any) {
    console.error("❌ ERROR:", err)
    return NextResponse.json(
      { error: "AI failed", message: err?.message },
      { status: 500 }
    )
  }
}