import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- voice_* tables not yet in generated types
const db = adminClient as any;

/**
 * POST /api/voice-agent/tools/summary
 * ElevenLabs Server Tool: Saves a structured call analysis at the end of each conversation.
 *
 * 17 analysis fields optimized for Numerologie PRO:
 * - Anruferdaten: name, email, telefon, sprache
 * - Klassifikation: kategorie, thema, anliegen
 * - Sales-Intelligence: interessiertes_paket, kaufbereitschaft, einwand, geburtsdatum_genannt
 * - Ergebnis: status, termin_gebucht, termin_datum, follow_up_noetig, naechster_schritt
 * - Zusammenfassung: freitext
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = db;

    // Helper: n8n sends booleans as strings ("true"/"false")
    const toBool = (v: unknown) =>
      v === true || v === "true" || v === "Ja";

    // Build the structured analysis record
    const analysis = {
      // Anruferdaten
      anrufer_name: body.anrufer_name || null,
      anrufer_email: body.anrufer_email || null,
      anrufer_telefon: body.anrufer_telefon || null,
      sprache: body.sprache || "de",
      // Klassifikation
      kategorie: body.kategorie || "Allgemein",
      thema: body.thema || "Allgemein",
      anliegen: body.anliegen || null,
      // Sales-Intelligence
      interessiertes_paket: body.interessiertes_paket || "keines",
      kaufbereitschaft: body.kaufbereitschaft || "unklar",
      einwand: body.einwand || "keiner",
      geburtsdatum_genannt: toBool(body.geburtsdatum_genannt),
      // Ergebnis
      status: body.status || "FAQ_beantwortet",
      termin_gebucht: toBool(body.termin_gebucht),
      termin_datum: body.termin_datum || null,
      follow_up_noetig: toBool(body.follow_up_noetig),
      naechster_schritt: body.naechster_schritt || "Keine_Aktion",
      // Zusammenfassung
      zusammenfassung: body.zusammenfassung || body.summary || null,
    };

    // Save to voice_call_analyses table
    const { data: insertData, error: insertError } = await supabase
      .from("voice_call_analyses")
      .insert(analysis)
      .select("id")
      .single();

    if (insertError) {
      console.error("[Voice Agent] Failed to save analysis:", insertError);
    } else {
      console.log("[Voice Agent] Analysis saved:", insertData?.id);
    }

    // Also update the lead record if we can find one
    const leadName = body.anrufer_name;
    const leadEmail = body.anrufer_email;

    if (leadName || leadEmail) {
      let leadQuery = supabase.from("voice_leads").select("id, status");

      if (leadEmail) {
        leadQuery = leadQuery.eq("email", leadEmail);
      } else if (leadName) {
        leadQuery = leadQuery.ilike("name", `%${leadName}%`);
      }

      const { data: lead } = await leadQuery
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (lead) {
        await supabase
          .from("voice_leads")
          .update({
            next_steps: body.naechster_schritt,
            status: body.termin_gebucht ? "demo_booked" : lead.status,
          })
          .eq("id", lead.id);
      }
    }

    // Forward to n8n for Google Sheets logging (fire-and-forget)
    // Skip if request came FROM n8n (avoid infinite loop)
    const n8nWebhookUrl = process.env.N8N_VOICE_REPORT_WEBHOOK_URL;
    if (n8nWebhookUrl && body.source !== "n8n") {
      fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysis),
      }).catch((err) =>
        console.error("[Voice Agent] n8n webhook error:", err)
      );
    }

    const msg =
      body.sprache === "ru"
        ? "Анализ сохранён. Можешь завершить разговор."
        : "Analyse gespeichert. Du kannst das Gespraech jetzt beenden.";

    return NextResponse.json({
      success: !insertError,
      message: msg,
    });
  } catch (error) {
    console.error("[Voice Agent] Summary error:", error);
    return NextResponse.json({
      success: true,
      message: "Analyse konnte nicht gespeichert werden.",
    });
  }
}
