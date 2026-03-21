import { NextResponse } from "next/server"
import { Buffer } from "buffer"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/* ============================= */
/* SAFE JSON EXTRACTOR */
/* ============================= */
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

/* ============================= */
/* IMAGE → BASE64 */
/* ============================= */
async function imageToBase64(url: string) {
  try {
    if (url.startsWith("data:image")) {
      return url.split(",")[1]
    }

    const res = await fetch(url)

    if (!res.ok) {
      throw new Error("Failed to fetch image")
    }

    const buffer = await res.arrayBuffer()
    return Buffer.from(buffer).toString("base64")
  } catch {
    throw new Error("Image processing failed")
  }
}

/* ============================= */
/* MAIN API */
/* ============================= */
export async function POST(req: Request) {
  try {
    /* ✅ FIXED: cookies() is async in your setup */
    const cookieStore = await cookies()

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
    /* PRODUCT AUTO FILL */
    /* ============================= */
    else if (mode === "product_autofill") {
      prompt = `
You are an AI product intelligence engine.

Return ONLY JSON:

{
  "matched_attributes": [
    {
      "attribute_id": "",
      "attribute_name": "",
      "matched_option_id": "",
      "matched_option_value": ""
    }
  ]
}

RULES:
- Match ONLY from given options
- DO NOT create new values
- If no match → skip

INPUT:
Category: ${category}
Attributes: ${JSON.stringify(existingAttributes)}
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
  "search": "",
  "tags": [],
  "city": null
}

Rules:
- Fix spelling
- Extract intent
- Keep tags generic

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

Rules:
- 5–15 tags
- Short keywords
- Include product, material, audience

Description:
${description}
`
    }

    /* ❌ INVALID MODE */
    else {
      return NextResponse.json(
        { error: "Invalid mode" },
        { status: 400 }
      )
    }

    let parts: any[] = [{ text: prompt }]

    /* ============================= */
    /* ADD IMAGE (SAFE) */
    /* ============================= */
    if (mode === "product_autofill" && imageUrl) {
      try {
        const base64Image = await imageToBase64(imageUrl)

        parts.push({
          inlineData: {
            mimeType: "image/*",
            data: base64Image,
          },
        })
      } catch {
        // ignore image failure
      }
    }

    /* ============================= */
    /* GEMINI CALL */
    /* ============================= */
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

    const parsed = extractJSON(text)

    /* ============================= */
    /* RESPONSES */
    /* ============================= */

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
      return NextResponse.json(
        parsed || { suggested_attributes: [] }
      )
    }

    if (mode === "product_autofill") {
      return NextResponse.json(
        parsed || { matched_attributes: [] }
      )
    }

    return NextResponse.json({ error: "Unhandled mode" })
  } catch (err: any) {
    return NextResponse.json(
      { error: "AI failed", message: err?.message },
      { status: 500 }
    )
  }
}