import { Appointment } from '@/domain/entities/Appointment';

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function toIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .trim();
}

function formatUtcStamp(date = new Date()): string {
  // YYYYMMDDTHHMMSSZ
  return (
    `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}` +
    `T${pad2(date.getUTCHours())}${pad2(date.getUTCMinutes())}${pad2(date.getUTCSeconds())}Z`
  );
}

function parsePreferredDate(value: string): { y: number; m: number; d: number } | null {
  const trimmed = (value || '').trim();
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return { y: Number(iso[1]), m: Number(iso[2]), d: Number(iso[3]) };

  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return { y: Number(slash[3]), m: Number(slash[1]), d: Number(slash[2]) };

  return null;
}

function parsePreferredTime(value: string): { hh: number; mm: number } | null {
  const trimmed = (value || '').trim();
  const m = trimmed.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (!m) return null;
  let hh = Number(m[1]);
  const mm = Number(m[2]);
  const meridiem = m[3].toUpperCase();
  if (hh === 12) hh = 0;
  if (meridiem === 'PM') hh += 12;
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return { hh, mm };
}

function formatFloatingLocalDateTime(parts: { y: number; m: number; d: number; hh: number; mm: number }): string {
  // YYYYMMDDTHHMMSS (floating local time; no Z)
  return `${parts.y}${pad2(parts.m)}${pad2(parts.d)}T${pad2(parts.hh)}${pad2(parts.mm)}00`;
}

export type AppointmentIcsOptions = {
  origin?: string;
  durationMinutes?: number;
  url?: string;
  summary: string;
  description?: string;
  location?: string;
};

export function buildAppointmentIcs(
  appointment: Pick<Appointment, 'id' | 'preferredDate' | 'preferredTime'>,
  options: AppointmentIcsOptions
): string | null {
  const dateParts = parsePreferredDate(appointment.preferredDate || '');
  if (!dateParts) return null;

  const timeParts = parsePreferredTime(appointment.preferredTime || '');
  const durationMinutes = options.durationMinutes ?? 30;

  const uid = `${toIcsText(appointment.id)}@pyetdoktorin`;
  const dtstamp = formatUtcStamp();
  const summary = toIcsText(options.summary);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pyet Doktorin//Appointments//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:${summary}`,
  ];

  if (options.location) lines.push(`LOCATION:${toIcsText(options.location)}`);

  const url = options.url ? options.url : undefined;
  if (url) lines.push(`URL:${toIcsText(url)}`);

  const descParts: string[] = [];
  if (options.description) descParts.push(options.description);
  if (url) descParts.push(`Open: ${url}`);
  if (descParts.length) lines.push(`DESCRIPTION:${toIcsText(descParts.join('\n'))}`);

  if (timeParts) {
    const start = { ...dateParts, ...timeParts };
    const startStr = formatFloatingLocalDateTime(start);

    const startDate = new Date(dateParts.y, dateParts.m - 1, dateParts.d, timeParts.hh, timeParts.mm, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);
    const endStr = formatFloatingLocalDateTime({
      y: endDate.getFullYear(),
      m: endDate.getMonth() + 1,
      d: endDate.getDate(),
      hh: endDate.getHours(),
      mm: endDate.getMinutes(),
    });

    lines.push(`DTSTART:${startStr}`);
    lines.push(`DTEND:${endStr}`);
  } else {
    // All-day fallback
    lines.push(`DTSTART;VALUE=DATE:${dateParts.y}${pad2(dateParts.m)}${pad2(dateParts.d)}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

