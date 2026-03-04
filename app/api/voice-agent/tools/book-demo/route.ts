import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- voice_* tables not yet in generated types
const db = adminClient as any;

const FREE_CONSULTATION_URL =
  "https://cal.com/swetlana-wagner-vn81pp/бесплатная-консультация";

/** Format phone number for Cal.com (requires spaces, e.g. "+49 151 5166 8273") */
function formatPhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  // German number: +49XXXXXXXXXX → +49 XXX XXXX XXXX (must be 11-12 digits after +49)
  if (digits.startsWith("+49")) {
    const rest = digits.slice(3);
    if (rest.length < 10) return null; // too short for valid German number
    return `+49 ${rest.slice(0, 3)} ${rest.slice(3, 7)} ${rest.slice(7)}`.trim();
  }
  // Other international: +XX XXXX XXXX XXXX (must have at least 8 digits after country code)
  if (digits.startsWith("+")) {
    const cc = digits.slice(0, 3);
    const rest = digits.slice(3);
    if (rest.length < 8) return null;
    return `${cc} ${rest.replace(/(\d{4})/g, "$1 ").trim()}`;
  }
  return null;
}

/**
 * POST /api/voice-agent/tools/book-demo
 * ElevenLabs Server Tool: Books a free consultation via Cal.com.
 *
 * Smart Booking Flow (2-step):
 * 1. Agent calls check-availability → gets 2-3 slots → presents to caller
 * 2. Caller picks a slot → Agent calls this endpoint with selected_slot ISO string
 *
 * Accepts `selected_slot` (ISO datetime) from the agent when the caller
 * has chosen a specific time from the options presented by check-availability.
 * Falls back to first available slot if selected_slot is not provided.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = db;
    const calApiKey = process.env.CALCOM_API_KEY;
    const eventTypeId = process.env.CALCOM_EVENT_TYPE_ID;
    const language = body.language || "de";

    if (!calApiKey || !eventTypeId) {
      const msg =
        language === "ru"
          ? `Я не могу сейчас забронировать. Сообщите звонящему ссылку: ${FREE_CONSULTATION_URL}`
          : `Ich kann den Termin gerade nicht direkt buchen. Bitte teile dem Anrufer den Booking-Link: ${FREE_CONSULTATION_URL}`;
      return NextResponse.json({
        success: true,
        message: msg,
        booking_url: FREE_CONSULTATION_URL,
      });
    }

    // Find the lead by name or email
    let leadId: string | null = null;
    if (body.lead_email) {
      const { data: lead } = await supabase
        .from("voice_leads")
        .select("id")
        .eq("email", body.lead_email)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      leadId = lead?.id || null;
    } else if (body.lead_name) {
      const { data: lead } = await supabase
        .from("voice_leads")
        .select("id")
        .ilike("name", `%${body.lead_name}%`)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      leadId = lead?.id || null;
    }

    // Determine which slot to book
    let slotTime: string;

    if (body.selected_slot) {
      // Smart flow: Agent passed the caller's chosen slot from check-availability
      slotTime = body.selected_slot;
    } else {
      // Legacy fallback: fetch first available slot
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const slotsResponse = await fetch(
        `https://api.cal.com/v1/slots?apiKey=${calApiKey}&eventTypeId=${eventTypeId}&startTime=${now.toISOString()}&endTime=${nextWeek.toISOString()}`
      );

      if (!slotsResponse.ok) {
        const msg =
          language === "ru"
            ? `Не удалось получить доступ к календарю. Ссылка: ${FREE_CONSULTATION_URL}`
            : `Ich kann gerade nicht auf den Kalender zugreifen. Booking-Link: ${FREE_CONSULTATION_URL}`;
        return NextResponse.json({
          success: true,
          message: msg,
          booking_url: FREE_CONSULTATION_URL,
        });
      }

      const slotsData = await slotsResponse.json();
      const availableSlots = Object.values(
        slotsData.slots || {}
      ).flat() as Array<{ time: string }>;

      if (availableSlots.length === 0) {
        const msg =
          language === "ru"
            ? `Нет свободных дат. Ссылка для записи: ${FREE_CONSULTATION_URL}`
            : `Keine freien Termine verfuegbar. Booking-Link: ${FREE_CONSULTATION_URL}`;
        return NextResponse.json({
          success: true,
          message: msg,
          booking_url: FREE_CONSULTATION_URL,
        });
      }

      slotTime = availableSlots[0].time;
    }

    // Build Cal.com responses with ALL required booking questions
    // Cal.com field slugs: name, email, phone are standard.
    // Custom fields use their Cal.com identifier (check Event Type → Booking Questions).
    const calResponses: Record<string, string> = {
      name: body.lead_name || "Numerologie-Interessent",
      email: body.lead_email || "no-email@placeholder.com",
    };

    // Phone (Cal.com attendeePhoneNumber — REQUIRED field, needs formatted number with spaces)
    // Fallback: Swetlana's business number — she knows this means caller didn't provide theirs
    const formattedPhone = body.lead_phone ? formatPhone(body.lead_phone) : null;
    calResponses.attendeePhoneNumber = formattedPhone || "+49 151 5166 8273";

    // Geburtsdatum / Дата рождения (required Short Text, slug: "Birth-Date")
    if (body.lead_birthdate) {
      calResponses["Birth-Date"] = body.lead_birthdate;
    }

    // Описание / Опишите ваш запрос (required Long Text, slug: "notes")
    // Cal.com has a min character requirement — pad short descriptions
    const description = body.lead_description
      || (language === "ru"
        ? "Бесплатная вводная консультация через голосового ассистента Лизу"
        : "Kostenloses Erstgespraech ueber die Sprachassistentin Lisa von Numerologie PRO");
    calResponses["notes"] = description.length < 20
      ? `${description} — Erstgespraech via Voice Agent`
      : description;

    // Какой способ общения (required Radio Group, slug: "Komunikation")
    // Options: "Telegramm" or "WhatsApp"
    calResponses["Komunikation"] = body.lead_communication_preference || "Telegramm";

    const getBookingPayload = () => ({
      eventTypeId: Number(eventTypeId),
      start: slotTime,
      timeZone: "Europe/Berlin",
      language: language === "ru" ? "ru" : "de",
      responses: calResponses,
      metadata: {
        source: "voice_agent",
        ...(leadId ? { lead_id: leadId } : {}),
        ...(body.lead_birthdate ? { birthdate: body.lead_birthdate } : {}),
      },
    });

    // Create booking via Cal.com
    let bookingResponse = await fetch(
      `https://api.cal.com/v1/bookings?apiKey=${calApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getBookingPayload()),
      }
    );

    if (!bookingResponse.ok) {
      const error = await bookingResponse.text();
      console.error("[Voice Agent] Cal.com booking error (1st attempt):", error);

      // If Cal.com rejects the phone number, retry without it
      if (error.includes("attendeePhoneNumber") && calResponses.attendeePhoneNumber) {
        delete calResponses.attendeePhoneNumber;
        bookingResponse = await fetch(
          `https://api.cal.com/v1/bookings?apiKey=${calApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(getBookingPayload()),
          }
        );
      }

      if (!bookingResponse.ok) {
        const finalError = await bookingResponse.text();
        console.error("[Voice Agent] Cal.com booking error (final):", finalError);
        const msg =
          language === "ru"
            ? `Не удалось забронировать. Ссылка: ${FREE_CONSULTATION_URL}`
            : `Termin konnte nicht gebucht werden. Booking-Link: ${FREE_CONSULTATION_URL}`;
        return NextResponse.json({
          success: true,
          message: msg,
          booking_url: FREE_CONSULTATION_URL,
        });
      }
    }

    const booking = await bookingResponse.json();
    const bookingDate = new Date(slotTime);

    const TZ = "Europe/Berlin";
    const formattedDateDe = bookingDate.toLocaleDateString("de-DE", {
      timeZone: TZ,
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
    const formattedDateRu = bookingDate.toLocaleDateString("ru-RU", {
      timeZone: TZ,
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Save appointment to DB
    if (leadId) {
      await supabase.from("voice_appointments").insert({
        lead_id: leadId,
        datetime: slotTime,
        duration_minutes: 15,
        calendar_event_id: booking.id?.toString(),
        calendar_url:
          booking.metadata?.videoCallUrl || FREE_CONSULTATION_URL,
        status: "scheduled",
      });

      // Update lead status
      await supabase
        .from("voice_leads")
        .update({ status: "demo_booked" })
        .eq("id", leadId);
    }

    const msg =
      language === "ru"
        ? `Бесплатная консультация успешно забронирована на ${formattedDateRu}. Светлана уже ждёт! Подтверждение придёт по email.`
        : `Kostenloses Erstgespraech erfolgreich gebucht fuer ${formattedDateDe}. Swetlana freut sich schon! Bestaetigung kommt per E-Mail.`;

    return NextResponse.json({
      success: true,
      message: msg,
      datetime: language === "ru" ? formattedDateRu : formattedDateDe,
      booking_id: booking.id,
    });
  } catch (error) {
    console.error("[Voice Agent] Book demo error:", error);
    return NextResponse.json({
      success: true,
      message: `Termin konnte nicht gebucht werden. Booking-Link: ${FREE_CONSULTATION_URL}`,
      booking_url: FREE_CONSULTATION_URL,
    });
  }
}
