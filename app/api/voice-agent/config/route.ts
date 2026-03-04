import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "config", "conversation.yaml");

/**
 * GET /api/voice-agent/config
 * Returns the current conversation.yaml content.
 */
export async function GET() {
  try {
    const content = fs.readFileSync(configPath, "utf-8");
    return new NextResponse(content, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return new NextResponse("# Config not found", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

/**
 * PUT /api/voice-agent/config
 * Updates the conversation.yaml file.
 */
export async function PUT(request: NextRequest) {
  try {
    const content = await request.text();

    // Basic YAML validation: must contain 'agent:' key
    if (!content.includes("agent:")) {
      return NextResponse.json(
        { error: "Invalid YAML: missing 'agent:' key" },
        { status: 400 }
      );
    }

    // Backup current config
    const backupPath = configPath.replace(
      ".yaml",
      `.backup-${Date.now()}.yaml`
    );
    if (fs.existsSync(configPath)) {
      fs.copyFileSync(configPath, backupPath);
    }

    // Write new config
    fs.writeFileSync(configPath, content, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Voice Agent] Config save error:", error);
    return NextResponse.json(
      { error: "Failed to save config" },
      { status: 500 }
    );
  }
}
