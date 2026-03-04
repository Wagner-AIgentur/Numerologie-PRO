import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = adminClient as any;
import {
  scoreLeadFromQualification,
  type QualificationData,
} from "@/lib/voice-scoring/lead-scorer";

/**
 * POST /api/voice-agent/tools/qualify
 * ElevenLabs Server Tool: Qualifies a lead based on Numerologie-PRO criteria.
 * Called by the voice agent during the conversation via function calling.
 *
 * 6 Criteria (from conversation.yaml):
 *  - interest_area (25%) — What brings them here
 *  - experience_level (15%) — Prior numerology experience
 *  - budget_readiness (25%) — Budget level
 *  - timeline (20%) — When they want to start
 *  - decision_authority (10%) — Can they decide alone
 *  - engagement (5%) — How engaged are they in the call
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = db;

    const qualification: QualificationData = {
      interest_area: body.interest_area,
      experience_level: body.experience_level,
      budget_readiness: body.budget_readiness,
      timeline: body.timeline,
      decision_authority: body.decision_authority,
      engagement: body.engagement,
    };

    // Score the lead
    const { score, grade, breakdown } =
      scoreLeadFromQualification(qualification);

    // Determine status based on grade
    const status = grade === "C" ? "new" : "qualified";

    // Upsert lead
    const { data: lead, error } = await supabase
      .from("voice_leads")
      .insert({
        name: body.name || null,
        company: null,
        email: body.email || null,
        phone: body.phone || null,
        language: body.language || "de",
        score,
        grade,
        status,
        qualification: { ...qualification, breakdown },
        objections: body.objections || [],
      })
      .select()
      .single();

    if (error) {
      console.error("[Voice Agent] Lead insert error:", error);
      return NextResponse.json(
        { error: "Failed to save lead" },
        { status: 500 }
      );
    }

    // Response that the agent will use to continue the conversation
    const gradeMessages: Record<string, string> = {
      A: `Dieser Lead ist ein A-Lead (Score: ${score}/100). Sehr hohes Interesse! Buche unbedingt ein kostenloses Erstgespraech mit Swetlana und empfehle das passende Paket.`,
      B: `Dieser Lead ist ein B-Lead (Score: ${score}/100). Gutes Interesse. Biete das kostenlose Erstgespraech an oder empfehle die PDF-Analyse als guenstigen Einstieg.`,
      C: `Dieser Lead ist ein C-Lead (Score: ${score}/100). Interesse noch gering. Empfehle den kostenlosen Rechner auf numerologie-pro.com und verabschiede dich freundlich.`,
    };

    return NextResponse.json({
      lead_id: lead.id,
      score,
      grade,
      recommendation: gradeMessages[grade],
    });
  } catch (error) {
    console.error("[Voice Agent] Qualify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
