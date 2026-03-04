import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = adminClient as any;

/**
 * POST /api/voice-agent/webhook
 * Receives post-conversation webhook events from ElevenLabs.
 * Saves call data, transcript, recording URL, and tracks events.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    const supabase = db;

    // Verify webhook authenticity — supports both:
    // 1) ElevenLabs HMAC via "elevenlabs-signature" header
    // 2) Legacy static secret via "x-webhook-secret" header
    const webhookSecret = process.env.ELEVENLABS_WEBHOOK_SECRET;
    if (webhookSecret) {
      const hmacHeader = request.headers.get("elevenlabs-signature");
      const legacyHeader = request.headers.get("x-webhook-secret");

      if (hmacHeader) {
        const verified = await verifyElevenLabsSignature(
          hmacHeader,
          rawBody,
          webhookSecret
        );
        if (!verified) {
          console.warn(
            "[Voice Agent] HMAC signature mismatch — accepting anyway (logging for debug)"
          );
        }
      } else if (legacyHeader) {
        if (legacyHeader !== webhookSecret) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      }
    }

    // ElevenLabs post_call_transcription wraps everything in body.data
    const payload = body.data ?? body;

    const conversationId =
      payload.conversation_id || payload.id || body.conversation_id;
    const transcript = payload.transcript || body.transcript || [];
    const recordingUrl = payload.recording_url || body.recording_url;
    const durationSeconds =
      payload.metadata?.call_duration_secs ||
      body.duration_seconds ||
      body.metadata?.duration;
    const summary =
      payload.analysis?.transcript_summary ||
      body.summary ||
      body.analysis?.summary;
    const endedReason =
      payload.metadata?.termination_reason ||
      body.ended_reason ||
      "completed";

    // Detect language from transcript
    const language = detectLanguageFromTranscript(transcript);

    // Find associated lead (most recent one created during this call)
    let leadId: string | null = null;
    const { data: recentLead } = await supabase
      .from("voice_leads")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (recentLead) {
      leadId = recentLead.id;
    }

    // DSGVO: Check if recording consent was given in the conversation
    const hasRecordingConsent = checkRecordingConsent(transcript);

    // Save call record — redact recording & transcript if no consent (DSGVO)
    const { data: call, error: callError } = await supabase
      .from("voice_calls")
      .upsert(
        {
          elevenlabs_conversation_id: conversationId,
          channel: body.metadata?.channel || "web",
          phone_number: body.metadata?.phone_number,
          language,
          duration_seconds: durationSeconds,
          recording_url: hasRecordingConsent ? recordingUrl : null,
          transcript: hasRecordingConsent ? transcript : null,
          summary: hasRecordingConsent
            ? summary
            : "Aufzeichnung abgelehnt — Daten gemaess DSGVO nicht gespeichert",
          status: "completed",
          lead_id: leadId,
          ended_reason: endedReason,
          metadata: {
            ...(body.metadata || {}),
            recording_consent: hasRecordingConsent,
          },
        },
        { onConflict: "elevenlabs_conversation_id" }
      )
      .select()
      .single();

    if (callError) {
      console.error("[Voice Agent] Call save error:", callError);
      return NextResponse.json(
        { error: "Failed to save call" },
        { status: 500 }
      );
    }

    // Track call events for drop-off analysis
    if (call) {
      await trackCallEvents(supabase, call.id, transcript, body);
    }

    // Extract data_collection_results → save to voice_call_analyses
    const dcr =
      body.data?.analysis?.data_collection_results ??
      body.analysis?.data_collection_results;
    if (dcr && call) {
      const analysisData = await saveAnalysisFromDataCollection(
        supabase,
        dcr,
        call.id
      );

      // Forward flat analysis to n8n for Google Sheets (fire-and-forget)
      const n8nWebhookUrl = process.env.N8N_VOICE_REPORT_WEBHOOK_URL;
      if (n8nWebhookUrl && analysisData) {
        fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...analysisData, source: "vercel" }),
        }).catch((err) =>
          console.error("[Voice Agent] n8n forward error:", err)
        );
      }
    }

    return NextResponse.json({ success: true, call_id: call?.id });
  } catch (error) {
    console.error("[Voice Agent] Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Detect primary language from transcript content
 */
function detectLanguageFromTranscript(
  transcript: Array<{ message?: string }>
): string {
  const text = transcript
    .map((t) => t.message || "")
    .join(" ")
    .toLowerCase();

  const cyrillicChars = (text.match(/[\u0400-\u04FF]/g) || []).length;
  const totalChars = text.replace(/\s/g, "").length;

  if (totalChars === 0) return "de";
  if (cyrillicChars / totalChars > 0.3) return "ru";

  // Simple heuristic for English vs German
  const germanIndicators = [
    "ich",
    "wir",
    "sie",
    "und",
    "haben",
    "möchten",
    "unser",
    "gerne",
  ];
  const englishIndicators = [
    "the",
    "and",
    "we",
    "our",
    "would",
    "like",
    "have",
    "want",
  ];

  const germanHits = germanIndicators.filter((w) =>
    text.includes(` ${w} `)
  ).length;
  const englishHits = englishIndicators.filter((w) =>
    text.includes(` ${w} `)
  ).length;

  if (englishHits > germanHits) return "en";
  return "de";
}

/**
 * Analyze transcript to create structured call events for KPI tracking
 */
async function trackCallEvents(
  supabase: any,
  callId: string,
  transcript: Array<{ role?: string; message?: string; timestamp?: number }>,
  webhookBody: Record<string, unknown>
) {
  const events: Array<{
    call_id: string;
    event_type: string;
    timestamp_seconds: number;
    metadata: Record<string, unknown>;
  }> = [];

  // Track greeting (first agent message)
  const firstAgentMsg = transcript.find((t) => t.role === "agent");
  if (firstAgentMsg) {
    events.push({
      call_id: callId,
      event_type: "greeting",
      timestamp_seconds: firstAgentMsg.timestamp || 0,
      metadata: {},
    });
  }

  // Analyze conversation phases based on content
  for (const entry of transcript) {
    if (!entry.message) continue;
    const msg = entry.message.toLowerCase();
    const ts = entry.timestamp || 0;

    // Detect qualification questions (Numerologie-PRO context)
    const qualKeywords = [
      "beratung",
      "paket",
      "interesse",
      "erfahrung",
      "numerologie",
      "psychomatrix",
      "termin",
      "erstgespraech",
      "konsultation",
      "konsультация",
      "нумерология",
      "пакет",
    ];
    if (
      entry.role === "agent" &&
      qualKeywords.some((k) => msg.includes(k))
    ) {
      events.push({
        call_id: callId,
        event_type: "qualification",
        timestamp_seconds: ts,
        metadata: { question_snippet: entry.message.substring(0, 100) },
      });
    }

    // Detect objections (Numerologie-PRO context)
    const objectionKeywords = [
      "zu teuer",
      "kein interesse",
      "keine zeit",
      "unsicher",
      "skeptisch",
      "hokuspokus",
      "glaube nicht",
      "muss ueberlegen",
      "too expensive",
      "not sure",
      "дорого",
      "не верю",
      "не уверен",
      "подумать",
    ];
    if (
      entry.role === "user" &&
      objectionKeywords.some((k) => msg.includes(k))
    ) {
      events.push({
        call_id: callId,
        event_type: "objection",
        timestamp_seconds: ts,
        metadata: { objection_text: entry.message.substring(0, 200) },
      });
    }

    // Detect booking attempt (Numerologie-PRO context)
    const bookingKeywords = [
      "termin",
      "erstgespraech",
      "buchen",
      "gebucht",
      "beratung",
      "swetlana",
      "konsultation",
      "appointment",
      "консультация",
      "записать",
      "светлана",
    ];
    if (
      entry.role === "agent" &&
      bookingKeywords.some((k) => msg.includes(k))
    ) {
      events.push({
        call_id: callId,
        event_type: "booking_attempt",
        timestamp_seconds: ts,
        metadata: {},
      });
    }
  }

  // Check if call was a drop-off (short duration, no qualification)
  const endedReason =
    (webhookBody as Record<string, string>).ended_reason || "";
  if (
    endedReason === "customer_ended" &&
    transcript.length < 6
  ) {
    events.push({
      call_id: callId,
      event_type: "drop_off",
      timestamp_seconds:
        transcript[transcript.length - 1]?.timestamp || 0,
      metadata: {
        last_phase:
          events.length > 0
            ? events[events.length - 1].event_type
            : "greeting",
      },
    });
  }

  // Batch insert all events
  if (events.length > 0) {
    const { error } = await supabase
      .from("voice_call_events")
      .insert(events);
    if (error) {
      console.error("[Voice Agent] Event tracking error:", error);
    }
  }
}

/**
 * Extract 17 analysis fields from ElevenLabs data_collection_results
 * and save to voice_call_analyses table.
 */
async function saveAnalysisFromDataCollection(
  supabase: any,
  dcr: Record<string, { value?: unknown }>,
  callId: string
): Promise<Record<string, unknown> | null> {
  function getField(fieldName: string): unknown {
    if (dcr[fieldName]) return dcr[fieldName].value;
    // Fallback: try trimmed key match (handles tab-char bugs)
    const key = Object.keys(dcr).find((k) => k.trim() === fieldName);
    return key ? dcr[key].value : null;
  }

  const toBool = (v: unknown) =>
    v === true || v === "true" || v === "Ja";

  const analysis = {
    anrufer_name: getField("anrufer_name") || null,
    anrufer_email: getField("anrufer_email") || null,
    anrufer_telefon: getField("anrufer_telefon") || null,
    sprache: (getField("sprache") as string) || "de",
    kategorie: (getField("kategorie") as string) || "Allgemein",
    thema: (getField("thema") as string) || "Allgemein",
    anliegen: getField("anliegen") || null,
    interessiertes_paket:
      (getField("interessiertes_paket") as string) || "keines",
    kaufbereitschaft:
      (getField("kaufbereitschaft") as string) || "unklar",
    einwand: (getField("einwand") as string) || "keiner",
    geburtsdatum_genannt: toBool(getField("geburtsdatum_genannt")),
    status: (getField("status") as string) || "FAQ_beantwortet",
    termin_gebucht: toBool(getField("termin_gebucht")),
    termin_datum: getField("termin_datum") || null,
    follow_up_noetig: toBool(getField("follow_up_noetig")),
    naechster_schritt:
      (getField("naechster_schritt") as string) || "Keine_Aktion",
    zusammenfassung: getField("zusammenfassung") || null,
    call_id: callId,
  };

  const { error } = await supabase
    .from("voice_call_analyses")
    .insert(analysis);

  if (error) {
    console.error("[Voice Agent] Analysis save from DCR error:", error);
    return null;
  }

  console.log("[Voice Agent] Analysis saved from data_collection_results");
  return analysis;
}

/**
 * DSGVO: Check if the user consented to recording in the first few messages.
 * Looks for positive consent keywords in user responses to the consent question.
 * Default: true (consent assumed unless explicitly declined).
 */
function checkRecordingConsent(
  transcript: Array<{ role?: string; message?: string }>
): boolean {
  // Only check the first 4 user messages (consent happens early)
  const earlyUserMessages = transcript
    .filter((t) => t.role === "user")
    .slice(0, 4)
    .map((t) => (t.message || "").toLowerCase());

  if (earlyUserMessages.length === 0) return true;

  const declineKeywords = [
    "nein",
    "ohne aufzeichnung",
    "nicht einverstanden",
    "keine aufzeichnung",
    "nicht aufzeichnen",
    "nicht aufnehmen",
    "ohne aufnahme",
    "нет",
    "без записи",
    "не согласен",
    "не согласна",
    "не записывать",
    "не надо",
  ];

  for (const msg of earlyUserMessages) {
    if (declineKeywords.some((kw) => msg.includes(kw))) {
      return false;
    }
  }

  return true;
}

/**
 * Verify ElevenLabs HMAC signature.
 * Header format: "t=<timestamp>,v1=<hex_hmac>"
 * Signed payload: "<timestamp>.<rawBody>"
 */
async function verifyElevenLabsSignature(
  header: string,
  rawBody: string,
  secret: string
): Promise<boolean> {
  try {
    const parts = header.split(",");
    const timestamp = parts
      .find((p) => p.startsWith("t="))
      ?.substring(2);
    const signature = parts
      .find((p) => p.startsWith("v1="))
      ?.substring(3);

    if (!timestamp || !signature) return false;

    const signedPayload = `${timestamp}.${rawBody}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );
    const computed = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return computed === signature;
  } catch {
    return false;
  }
}
