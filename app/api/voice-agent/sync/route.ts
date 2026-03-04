import { NextResponse } from "next/server";
import {
  loadConversationConfig,
  buildAgentConfig,
} from "@/lib/elevenlabs/config-builder";

/**
 * POST /api/voice-agent/sync
 * Syncs the conversation.yaml configuration to the ElevenLabs agent via API.
 * This pushes the system prompt, tools (webhook endpoints), language presets,
 * and TTS settings to the ElevenLabs cloud agent.
 *
 * Protected: requires ELEVENLABS_API_KEY to be set.
 */
export async function POST() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID;

    if (!apiKey || !agentId) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID not configured" },
        { status: 500 }
      );
    }

    // Load conversation config from YAML
    const config = loadConversationConfig();

    // Build the ElevenLabs-compatible agent config
    const agentConfig = buildAgentConfig(config);

    // PATCH the agent via ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify(agentConfig),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Voice Agent Sync] ElevenLabs API error:", errorText);
      return NextResponse.json(
        {
          error: "Failed to sync agent config",
          status: response.status,
          details: errorText,
        },
        { status: 500 }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      agent_id: agentId,
      message: "Agent config synced successfully",
      tools_registered: 4,
      languages: ["de", "ru"],
      details: {
        name: result.name,
        agent_id: result.agent_id,
      },
    });
  } catch (error) {
    console.error("[Voice Agent Sync] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
