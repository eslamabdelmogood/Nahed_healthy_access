import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 500 })
    }

    // Call ElevenLabs API with eleven_multilingual_v2 model
    const elevenLabsResponse = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!elevenLabsResponse.ok) {
      const errorData = await elevenLabsResponse.json().catch(() => ({}))

      console.error("[v0] ElevenLabs API error details:", {
        status: elevenLabsResponse.status,
        error: errorData,
        message: errorData?.detail?.message || "Unknown error",
      })

      if (elevenLabsResponse.status === 401) {
        const message =
          errorData?.detail?.status === "missing_permissions"
            ? "Your ElevenLabs account doesn't have text-to-speech permissions. Please check your subscription plan includes TTS access."
            : "Authentication failed. Please verify your API key is correct."
        return NextResponse.json({ error: message, fallback: true }, { status: 401 })
      }

      if (elevenLabsResponse.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later.", fallback: true },
          { status: 429 },
        )
      }

      if (elevenLabsResponse.status === 400) {
        return NextResponse.json({ error: "Invalid request to ElevenLabs API.", fallback: true }, { status: 400 })
      }

      return NextResponse.json({ error: "Failed to generate audio from ElevenLabs", fallback: true }, { status: 500 })
    }

    // Get the audio as a stream
    const audioBuffer = await elevenLabsResponse.arrayBuffer()

    // Return audio with appropriate headers
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] TTS error:", error)
    return NextResponse.json({ error: "Failed to process text-to-speech request", fallback: true }, { status: 500 })
  }
}
