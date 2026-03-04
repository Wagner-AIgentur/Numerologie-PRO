import { NextResponse } from "next/server";

/**
 * GET /api/voice-agent/signed-url
 * Generates a signed URL for the ElevenLabs web widget.
 * This prevents exposing the agent ID in the frontend.
 */
export async function GET() {
  try {
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!agentId || !apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("[Voice Agent] Signed URL error:", error);
      return NextResponse.json(
        { error: "Failed to generate signed URL" },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ signed_url: data.signed_url });
  } catch (error) {
    console.error("[Voice Agent] Signed URL error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
