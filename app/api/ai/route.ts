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

    console.log("📥 REQUEST BODY:", JSON.stringify(body, null, 2))

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
    /* 🔥 PRODUCT AUTO FILL (FINAL FIX) */
    /* ============================= */
    else if (mode === "product_autofill") {

      const simplifiedAttributes = (existingAttributes || [])
        .map((attr: any) => {
          const optionsArray = attr.options || []

          const options = optionsArray
            .map((o: any) => o.value)
            .filter(Boolean)
            .join(", ")

          // 🔥 CRITICAL FIX → skip empty attributes
          if (!options) return null

          return `Attribute: ${attr.name}\nOptions: ${options}`
        })
        .filter(Boolean)
        .join("\n\n")

      console.log("🧠 SIMPLIFIED ATTRIBUTES:\n", simplifiedAttributes)

      // 🔥 If no valid attributes → stop early
      if (!simplifiedAttributes) {
        console.log("❌ NO VALID ATTRIBUTES SENT TO AI")
        return NextResponse.json({ matched_attributes: [] })
      }

      prompt = `
You are an AI product attribute matcher.

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

- ONLY choose from given options EXACTLY
- DO NOT create new values
- DO NOT modify option text
- Return exact option string from list

INPUT:
Category: ${category}

${simplifiedAttributes}

Name: ${productName || ""}
Description: ${description || ""}
`

      console.log("🧾 FINAL PROMPT:\n", prompt)
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
      console.log("🖼 IMAGE URL:", imageUrl)

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

    console.log("🤖 GEMINI RAW RESPONSE:", JSON.stringify(result, null, 2))

    const text =
      result?.candidates?.[0]?.content?.parts?.[0]?.text || ""

    console.log("📝 AI TEXT OUTPUT:", text)

    const parsed = extractJSON(text)

    console.log("✅ PARSED JSON:", JSON.stringify(parsed, null, 2))

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