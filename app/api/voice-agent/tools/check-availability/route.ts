import { NextRequest, NextResponse } from "next/server";

const FREE_CONSULTATION_URL =
  "https://cal.com/swetlana-wagner-vn81pp/бесплатная-консультация";

const TZ = "Europe/Berlin";

/**
 * POST /api/voice-agent/tools/check-availability
 * ElevenLabs Server Tool: Checks Swetlana's calendar for available slots.
 * Returns ALL slots grouped by day so the agent can offer day + time choices.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const calApiKey = process.env.CALCOM_API_KEY;
    const eventTypeId = process.env.CALCOM_EVENT_TYPE_ID;
    const language = body.language || "de";

    if (!calApiKey || !eventTypeId) {
      const msg =
        language === "ru"
          ? `Я не могу сейчас проверить календарь. Пожалуйста, сообщите звонящему ссылку для записи: ${FREE_CONSULTATION_URL}`
          : `Ich kann den Kalender gerade nicht pruefen. Bitte teile dem Anrufer den Booking-Link: ${FREE_CONSULTATION_URL}`;
      return NextResponse.json({
        success: false,
        message: msg,
        booking_url: FREE_CONSULTATION_URL,
      });
    }

    // Fetch slots for the next 14 days
    const now = new Date();
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const slotsResponse = await fetch(
      `https://api.cal.com/v1/slots?apiKey=${calApiKey}&eventTypeId=${eventTypeId}&startTime=${now.toISOString()}&endTime=${twoWeeks.toISOString()}`
    );

    if (!slotsResponse.ok) {
      const msg =
        language === "ru"
          ? `Я не могу сейчас проверить календарь. Ссылка для записи: ${FREE_CONSULTATION_URL}`
          : `Ich kann gerade nicht auf den Kalender zugreifen. Booking-Link: ${FREE_CONSULTATION_URL}`;
      return NextResponse.json({
        success: false,
        message: msg,
        booking_url: FREE_CONSULTATION_URL,
      });
    }

    const slotsData = await slotsResponse.json();
    const allSlots = Object.values(slotsData.slots || {}).flat() as Array<{
      time: string;
    }>;

    if (allSlots.length === 0) {
      const msg =
        language === "ru"
          ? `К сожалению, в ближайшие две недели нет свободных дат. Ссылка для записи: ${FREE_CONSULTATION_URL}`
          : `Leider sind in den naechsten zwei Wochen keine Termine frei. Booking-Link: ${FREE_CONSULTATION_URL}`;
      return NextResponse.json({
        success: false,
        message: msg,
        booking_url: FREE_CONSULTATION_URL,
      });
    }

    // Group ALL slots by day (max 5 days)
    const byDay = new Map<string, Array<{ time: string }>>();
    for (const slot of allSlots) {
      const dayKey = new Date(slot.time).toLocaleDateString("de-DE", {
        timeZone: TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      if (!byDay.has(dayKey)) {
        byDay.set(dayKey, []);
      }
      byDay.get(dayKey)!.push(slot);
    }

    const days: Array<{
      day_label: string;
      slots: Array<{ iso: string; time_label: string }>;
    }> = [];

    let dayCount = 0;
    for (const [, daySlots] of byDay) {
      if (dayCount >= 5) break;
      dayCount++;

      const firstSlot = new Date(daySlots[0].time);
      const dayLabel = firstSlot.toLocaleDateString(
        language === "ru" ? "ru-RU" : "de-DE",
        {
          timeZone: TZ,
          weekday: "long",
          day: "numeric",
          month: "long",
        }
      );

      const slotEntries = daySlots.map((s) => {
        const d = new Date(s.time);
        return {
          iso: s.time,
          time_label: d.toLocaleTimeString(
            language === "ru" ? "ru-RU" : "de-DE",
            {
              timeZone: TZ,
              hour: "2-digit",
              minute: "2-digit",
            }
          ),
        };
      });

      days.push({ day_label: dayLabel, slots: slotEntries });
    }

    // Build a readable message for the agent
    const dayMessages = days.map((d) => {
      const times = d.slots.map((s) => s.time_label).join(", ");
      return `${d.day_label}: ${times}`;
    });
    const msg = dayMessages.join(" ... ");

    // Flat list for easy ISO lookup when booking
    const allFormattedSlots = days.flatMap((d) =>
      d.slots.map((s) => ({
        iso: s.iso,
        day: d.day_label,
        time: s.time_label,
      }))
    );

    return NextResponse.json({
      success: true,
      message: msg,
      days,
      all_slots: allFormattedSlots,
      slot_count: allFormattedSlots.length,
    });
  } catch (error) {
    console.error("[Voice Agent] Check availability error:", error);
    return NextResponse.json({
      success: false,
      message: `Kalender-Abfrage fehlgeschlagen. Booking-Link: ${FREE_CONSULTATION_URL}`,
      booking_url: FREE_CONSULTATION_URL,
    });
  }
}
