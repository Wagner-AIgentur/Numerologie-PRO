import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { isDemoReviewer } from "@/lib/auth/admin-guard";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = adminClient as any;

interface AnalysisRow {
  kategorie: string;
  kaufbereitschaft: string;
  einwand: string;
  interessiertes_paket: string;
  status: string;
  termin_gebucht: boolean;
  follow_up_noetig: boolean;
}

/**
 * GET /api/voice-agent/stats?days=30
 * Returns Voice Agent KPIs for the dashboard — now includes voice_call_analyses.
 */
export async function GET(request: NextRequest) {
  try {
    const days = Number(request.nextUrl.searchParams.get("days")) || 30;
    return NextResponse.json(await manualStats(days));
  } catch (error) {
    console.error("[Voice Agent] Stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function manualStats(days: number) {
  const supabase = db;
  const since = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString();

  // Demo reviewers only see demo data (consistent with RLS on detail pages)
  const isDemo = await isDemoReviewer();

  let callsQ = supabase
    .from("voice_calls")
    .select("id, status, duration_seconds, lead_id, created_at")
    .gte("created_at", since);
  let leadsQ = supabase
    .from("voice_leads")
    .select("id, grade, score, status, created_at")
    .gte("created_at", since);
  let appointmentsQ = supabase
    .from("voice_appointments")
    .select("id, status, created_at")
    .gte("created_at", since);
  let analysesQ = supabase
    .from("voice_call_analyses")
    .select("kategorie, kaufbereitschaft, einwand, interessiertes_paket, status, termin_gebucht, follow_up_noetig")
    .gte("created_at", since);

  if (isDemo) {
    callsQ = callsQ.eq("is_demo", true);
    leadsQ = leadsQ.eq("is_demo", true);
    appointmentsQ = appointmentsQ.eq("is_demo", true);
    analysesQ = analysesQ.eq("is_demo", true);
  }

  const [callsRes, leadsRes, appointmentsRes, analysesRes] = await Promise.all([
    callsQ, leadsQ, appointmentsQ, analysesQ,
  ]);

  const calls = (callsRes.data || []) as Array<{
    id: string;
    status: string;
    duration_seconds: number | null;
    lead_id: string | null;
    created_at: string;
  }>;
  const leads = (leadsRes.data || []) as Array<{
    id: string;
    grade: string;
    score: number;
    status: string;
    created_at: string;
  }>;
  const appointments = (appointmentsRes.data || []) as Array<{
    id: string;
    status: string;
    created_at: string;
  }>;
  const analyses = (analysesRes.data || []) as AnalysisRow[];

  const completedCalls = calls.filter((c) => c.status === "completed");
  const avgDuration =
    completedCalls.length > 0
      ? completedCalls.reduce(
          (sum, c) => sum + (c.duration_seconds || 0),
          0
        ) / completedCalls.length
      : 0;

  const conversionRate =
    completedCalls.length > 0
      ? (appointments.length / completedCalls.length) * 100
      : 0;

  // ── Aggregate voice_call_analyses ──
  const kaufbereitschaftCounts: Record<string, number> = {};
  const kategorieCounts: Record<string, number> = {};
  const paketCounts: Record<string, number> = {};
  const einwandCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};
  let followUpCount = 0;
  let terminCount = 0;

  for (const a of analyses) {
    kaufbereitschaftCounts[a.kaufbereitschaft] = (kaufbereitschaftCounts[a.kaufbereitschaft] || 0) + 1;
    kategorieCounts[a.kategorie] = (kategorieCounts[a.kategorie] || 0) + 1;
    if (a.interessiertes_paket && a.interessiertes_paket !== "keines") {
      paketCounts[a.interessiertes_paket] = (paketCounts[a.interessiertes_paket] || 0) + 1;
    }
    if (a.einwand && a.einwand !== "keiner") {
      einwandCounts[a.einwand] = (einwandCounts[a.einwand] || 0) + 1;
    }
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    if (a.follow_up_noetig) followUpCount++;
    if (a.termin_gebucht) terminCount++;
  }

  const toSorted = (map: Record<string, number>) =>
    Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

  return {
    // Existing KPIs
    total_calls: calls.length,
    completed_calls: completedCalls.length,
    conversion_rate: Math.round(conversionRate * 10) / 10,
    avg_duration_seconds: Math.round(avgDuration),
    leads_by_grade: {
      A: leads.filter((l) => l.grade === "A").length,
      B: leads.filter((l) => l.grade === "B").length,
      C: leads.filter((l) => l.grade === "C").length,
    },
    total_appointments: appointments.length,
    top_objections: toSorted(einwandCounts),
    drop_off_points: [],

    // ── NEW: voice_call_analyses aggregates ──
    total_analyses: analyses.length,
    follow_up_noetig: followUpCount,
    termine_gebucht: terminCount,
    kaufbereitschaft: toSorted(kaufbereitschaftCounts),
    kategorien: toSorted(kategorieCounts),
    interessierte_pakete: toSorted(paketCounts),
    call_status_verteilung: toSorted(statusCounts),
  };
}
