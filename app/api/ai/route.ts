import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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
      productName,
      description,
      query,
    } = body

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY" },
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
    /* PRODUCT AUTO FILL (DESCRIPTION BASED) */
    /* ============================= */
    else if (mode === "product_autofill") {

      const simplifiedAttributes = (existingAttributes || [])
        .map((attr: any) => {
          const optionsArray = attr.options || []

          if (!optionsArray.length) return null

          const options = optionsArray
            .map((o: any) => o.value)
            .join(", ")

          return `ATTRIBUTE ID: ${attr.id}
ATTRIBUTE NAME: ${attr.name}
OPTIONS: ${options}`
        })
        .filter(Boolean)
        .join("\n\n")

      if (!simplifiedAttributes) {
        return NextResponse.json({ matched_attributes: [] })
      }

      prompt = `
You are a product attribute selector.

Return ONLY JSON:

{
  "matched_attributes": [
    {
      "attribute_id": "",
      "selected_option": ""
    }
  ]
}

STRICT RULES:
- Choose ONLY from given options
- Match even if spelling is incorrect or approximate
- Understand abbreviations (e.g. "st." = straight, "3 quater" = 3/4)
- Return the closest matching option from the list
- DO NOT create new values
- ALWAYS return one option per attribute
- NEVER skip any attribute

PRODUCT DESCRIPTION:
${description || productName || ""}

AVAILABLE ATTRIBUTES:
${simplifiedAttributes}
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
    /* GROQ REQUEST */
    /* ============================= */

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-70b-8192", // ✅ best free model
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.2
        })
      }
    )

    const result = await response.json()

    console.log("FULL GROQ RESPONSE:", result)

    const text =
      result?.choices?.[0]?.message?.content || ""

    console.log("AI TEXT:", text)

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