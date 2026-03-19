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
  if (url.startsWith("data:image")) {
    return url.split(",")[1]
  }

  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch image")

  const buffer = await res.arrayBuffer()
  return Buffer.from(buffer).toString("base64")
}

export async function POST(req: Request) {
  try {
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
    if (mode === "product_autofill") {
      prompt = `
Return ONLY JSON:
{
  "moderation": { "allowed": true, "reason": "" },
  "matched_attributes": [],
  "new_option_suggestions": []
}
Category: ${category}
Attributes: ${JSON.stringify(existingAttributes)}
Name: ${productName || ""}
Description: ${description || ""}
`
    }

    /* ============================= */
    /* SEARCH PARSER */
    /* ============================= */
    if (mode === "search_parse") {
      prompt = `
Return ONLY JSON:
{
  "search": "",
  "tags": [],
  "city": null
}
Query: ${query}
`
    }

    /* ============================= */
    /* KEYWORD GENERATOR */
    /* ============================= */
    if (mode === "keyword_generate") {
      prompt = `
Return ONLY JSON:
{
  "tags": [],
  "tags_text": ""
}
Rules:
- 5 to 15 keywords
- short and searchable
Business:
${description}
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

    /* 🔥 TIMEOUT PROTECTION */
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
        }),
        signal: controller.signal,
      }
    )

    clearTimeout(timeout)

    const result = await response.json()

    const text =
      result?.candidates?.[0]?.content?.parts?.[0]?.text || ""

    const parsed = extractJSON(text)

    /* RESPONSES */

    if (mode === "keyword_generate") {
      return NextResponse.json(
        parsed || {
          tags: ["manufacturer", "supplier", "wholesale"],
          tags_text: "manufacturer supplier wholesale",
        }
      )
    }

    if (mode === "search_parse") {
      return NextResponse.json(
        parsed || {
          search: query,
          tags: [],
          city: null,
        }
      )
    }

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

    /* 🔥 TIMEOUT FALLBACK */
    if (err.name === 'AbortError') {
      return NextResponse.json({
        tags: ["manufacturer", "supplier", "wholesale"],
        tags_text: "manufacturer supplier wholesale",
      })
    }

    return NextResponse.json(
      { error: "AI failed", message: err?.message },
      { status: 500 }
    )
  }
}