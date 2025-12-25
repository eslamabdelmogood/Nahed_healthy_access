import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

const SYSTEM_PROMPT = `You are a medical data extraction specialist. Your task is to analyze medical reports (PDFs, images, or documents) and extract structured patient data.

When analyzing medical reports, extract information and return ONLY valid JSON (no markdown, no explanations) that matches this exact schema:

{
  "patient_id": "NAHED-YYYY-NNN",
  "clinical_data": {
    "diagnosis": "string - primary diagnosis",
    "stage": "string - if applicable (e.g., IIB, Stage 3)",
    "biomarkers": {
      "HER2": "string - positive/negative/unknown",
      "ER": "string - positive/negative/unknown",
      "PR": "string - positive/negative/unknown"
    },
    "urgency_score": "number - 0-1 scale",
    "recommended_action": "string - clinical recommendation"
  },
  "financial_profile": {
    "annual_income": "number or string",
    "income_currency": "string - e.g., EGP, USD",
    "country": "string - country name",
    "insurance_status": "string - insured/uninsured/partial",
    "fibo_class": "string - Low-Income Household/Middle-Income/etc"
  },
  "pharma_integration": {
    "drug_needed": {
      "generic_name": "string",
      "brand_options": ["string"],
      "treatment_duration_months": "number",
      "estimated_market_cost": "string"
    },
    "eligibility_flags": {
      "income_verified": "boolean",
      "clinical_need_verified": "boolean"
    },
    "patient_access_program": {
      "program_name": "string",
      "subsidy_percentage": "number",
      "application_status": "string"
    }
  },
  "holistic_support": {
    "nutrition_plan": {
      "regimen_type": "string",
      "focus": "string",
      "recommended_foods": ["string"],
      "avoid": ["string"],
      "hydration_goal": "string"
    },
    "psychological_support": {
      "assessment": "string",
      "recommended_intervention": "string",
      "resource_assigned": "string",
      "support_session_available": "boolean"
    }
  },
  "logistics": {
    "nearest_center": "string",
    "distance_km": "number",
    "next_appointment": "string - ISO 8601 format",
    "transport_support_needed": "boolean",
    "ngo_contacts": [
      {
        "name": "string",
        "contact": "string",
        "support_type": "string"
      }
    ]
  },
  "diagnostic_summary": {
    "urgency": "string - High/Medium/Low",
    "clinical_steps": ["string"]
  },
  "fibo_financial_mapping": {
    "estimated_total_cost": "number",
    "funding_sources": {
      "patient_coverage": "number",
      "ngo_support": "number",
      "grant_pending": "number"
    }
  }
}

If any information is not available in the report, use reasonable defaults or null values. Return ONLY the JSON object, nothing else.`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const supportedTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"]

    if (!supportedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type. Supported types: PDF, JPEG, PNG, GIF, WebP`,
        },
        { status: 400 },
      )
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")

    // Determine media type
    let mimeType = file.type
    if (file.type === "application/pdf") {
      mimeType = "application/pdf"
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const response = await model.generateContent([
      {
        text: SYSTEM_PROMPT,
      },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64,
        },
      },
    ])

    const responseText = response.response.text()

    let extractedData
    try {
      // Try to extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }
      extractedData = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", responseText)
      return NextResponse.json({ error: "Failed to parse medical data from report" }, { status: 500 })
    }

    return NextResponse.json(extractedData)
  } catch (error) {
    console.error("Error analyzing report:", error)
    return NextResponse.json({ error: "Failed to analyze medical report" }, { status: 500 })
  }
}
