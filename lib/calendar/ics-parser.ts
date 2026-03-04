export interface CalendarEvent {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  start: string; // ISO string
  end: string;   // ISO string
  allDay: boolean;
}

/** Unfold ICS lines (RFC 5545: continuation lines start with space/tab) */
function unfold(text: string): string {
  return text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
}

/** Unescape ICS text values */
function unescape(value: string): string {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

/** Parse ICS date/datetime string to ISO string */
function parseICSDate(raw: string, tzid?: string): { iso: string; allDay: boolean } {
  const clean = raw.trim();

  // All-day: YYYYMMDD
  if (/^\d{8}$/.test(clean)) {
    const y = clean.slice(0, 4);
    const m = clean.slice(4, 6);
    const d = clean.slice(6, 8);
    return { iso: `${y}-${m}-${d}T00:00:00`, allDay: true };
  }

  // DateTime: YYYYMMDDTHHmmss or YYYYMMDDTHHmmssZ
  const match = clean.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (match) {
    const [, y, mo, d, h, mi, s, z] = match;
    const iso = `${y}-${mo}-${d}T${h}:${mi}:${s}${z || ''}`;
    return { iso, allDay: false };
  }

  return { iso: clean, allDay: false };
}

/** Extract field value from an ICS property line (handles parameters like TZID) */
function extractField(block: string, fieldName: string): { value: string; params: string } {
  const lines = block.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(`${fieldName}:`) || trimmed.startsWith(`${fieldName};`)) {
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) continue;
      const before = trimmed.slice(0, colonIdx);
      const value = trimmed.slice(colonIdx + 1);
      const params = before.includes(';') ? before.slice(before.indexOf(';') + 1) : '';
      return { value: value.trim(), params };
    }
  }
  return { value: '', params: '' };
}

export function parseICS(icsText: string): CalendarEvent[] {
  const unfolded = unfold(icsText);
  const events: CalendarEvent[] = [];
  const blocks = unfolded.split('BEGIN:VEVENT');

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split('END:VEVENT')[0];

    const { value: uid } = extractField(block, 'UID');
    const { value: summary } = extractField(block, 'SUMMARY');
    const { value: description } = extractField(block, 'DESCRIPTION');
    const { value: location } = extractField(block, 'LOCATION');
    const { value: dtstart, params: startParams } = extractField(block, 'DTSTART');
    const { value: dtend } = extractField(block, 'DTEND');

    if (!dtstart) continue;

    const tzid = startParams.match(/TZID=([^;:]+)/)?.[1];
    const start = parseICSDate(dtstart, tzid);
    const end = dtend ? parseICSDate(dtend, tzid) : start;

    events.push({
      uid: uid || `event-${i}`,
      summary: summary ? unescape(summary) : 'Ohne Titel',
      description: description ? unescape(description) : undefined,
      location: location ? unescape(location) : undefined,
      start: start.iso,
      end: end.iso,
      allDay: start.allDay,
    });
  }

  return events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}
