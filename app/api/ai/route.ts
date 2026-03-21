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

  if (!res.ok) {
    throw new Error("Failed to fetch image")
  }

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
You are an AI product intelligence engine for a multi-category marketplace.

You may receive:
- Product image (important)
- Product name (optional)
- Description (optional)
- Existing attributes

Your goal is to identify and structure product data for ANY industry.

Return ONLY JSON:

{
  "moderation": {
    "allowed": true,
    "reason": ""
  },
  "product_type": "",
  "category_guess": "",
  "brand": "",
  "color": "",
  "material": "",
  "usage": "",
  "target_audience": "",
  "key_features": [],
  "suggested_title": "",
  "suggested_description": "",
  "matched_attributes": [],
  "new_option_suggestions": []
}

INSTRUCTIONS:

1. Use IMAGE as primary source if available
2. If no image → use text
3. Be INDUSTRY AGNOSTIC (no garment bias)

4. Detect:
- product_type → specific (e.g., laptop, kurti, toy car, drill machine)
- category_guess → broad (electronics, clothing, hardware, toys, furniture, etc.)
- brand → if visible or inferable
- color → simple (black, blue, red)
- material → if visible (plastic, wood, metal, cotton, etc.)
- usage → what it is used for
- target_audience → men, women, kids, universal, professionals, etc.

5. key_features:
- 3–6 short bullet features
- Based on visual + text

6. suggested_title:
- Clean, marketplace-ready
- Not too long

7. suggested_description:
- 1–2 lines
- Generic, not marketing fluff

8. matched_attributes:
- Match with given attributes if possible

9. new_option_suggestions:
- Suggest missing useful attributes

INPUT:
Category: ${category}
Existing Attributes: ${JSON.stringify(existingAttributes)}
Name: ${productName || ""}
Description: ${description || ""}
`
}

    /* ============================= */
    /* 🔥 SEARCH PARSER */
    /* ============================= */
    if (mode === "search_parse") {
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

Examples:
"denm jaipur"
→ {"search":"denim","tags":["denim"],"city":"jaipur"}

"steel utensils delhi"
→ {"search":"utensils","tags":["kitchen","steel"],"city":"delhi"}

Query: ${query}
`
    }

    /* ============================= */
    /* 🔥 KEYWORD GENERATOR */
    /* ============================= */
    if (mode === "keyword_generate") {
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
- Keep them generic and searchable

Business Description:
${description}
`
    }

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

    /* 🔥 KEYWORD RESPONSE */
    if (mode === "keyword_generate") {
      return NextResponse.json(
        parsed || {
          tags: [],
          tags_text: "",
        }
      )
    }

    /* 🔥 SEARCH RESPONSE */
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
    return NextResponse.json(
      { error: "AI failed", message: err?.message },
      { status: 500 }
    )
  }
}