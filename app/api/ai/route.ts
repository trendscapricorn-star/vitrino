import { NextResponse } from "next/server"
import { Buffer } from "buffer"
import { createServerClient } from "@supabase/ssr"
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
    /* 🔥 PRODUCT AUTO FILL (FIXED) */
    /* ============================= */
    else if (mode === "product_autofill") {
      const simplifiedAttributes = existingAttributes
        ?.map((attr: any) => {
          const options = attr.options?.map((o: any) => o.value).join(", ")
          return `Attribute: ${attr.name}\nOptions: ${options}`
        })
        .join("\n\n")

      prompt = `
You are an AI product attribute matcher.

You will receive:
- Product image (if available)
- Product name
- Description
- Attributes with options

Your job:
Select the BEST matching option for each attribute.

Return ONLY JSON:

{
  "matched_attributes": [
    {
      "attribute_name": "",
      "matched_option_value": ""
    }
  ]
}

RULES:

- ONLY choose from given options
- DO NOT create new values
- Use closest match (not exact required)

Examples:
- "blue" → "Blue"
- "light blue" → "Blue"
- "denim" → "Denim Fabric"

- Prefer image first, then text
- Skip only if completely unrelated

INPUT:
Category: ${category}

${simplifiedAttributes}

Name: ${productName || ""}
Description: ${description || ""}
`
    }

    /* ============================= */
    /* 🔍 SEARCH PARSER */
    /* ============================= */
    else if (mode === "search_parse") {
      prompt = `
You are a marketplace search parser.

Return ONLY JSON:

{
  "search": "main keyword",
  "tags": [],
  "city": null
}

Rules:
- Fix spelling (denm → denim)
- Extract intent
- Keep tags generic (multi-industry)

Query: ${query}
`
    }

    /* ============================= */
    /* 🔥 KEYWORD GENERATOR */
    /* ============================= */
    else if (mode === "keyword_generate") {
      prompt = `
You are helping a B2B manufacturer improve discoverability.

Based on the business description, generate search keywords.

Return ONLY JSON:

{
  "tags": [],
  "tags_text": ""
}

Rules:
- Tags should be short (1-2 words)
- Include product types, categories, materials, audience
- Minimum 5, maximum 15 tags

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

    const parsed = extractJSON(text)

    /* ============================= */
    /* RESPONSES */
    /* ============================= */

    if (mode === "keyword_generate") {
      return NextResponse.json(
        parsed || {
          tags: [],
          tags_text: "",
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
        matched_attributes: [],
      }
    )

  } catch (err: any) {
    return NextResponse.json(
      { error: "AI failed", message: err?.message },
      { status: 500 }
    )
  }
}