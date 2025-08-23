// Utility to parse date and time strings like '2025-08-23' and '01:00 PM' into a Date object
// Handles 12-hour time with AM/PM

export function parseDateTime(dateStr: string, timeStr: string): Date {
  // Expect dateStr: 'YYYY-MM-DD', timeStr: 'hh:mm AM/PM'
  const [hourMin, ampm] = timeStr.split(' ');
  let [hour, minute] = hourMin.split(':').map(Number);
  if (ampm?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (ampm?.toUpperCase() === 'AM' && hour === 12) hour = 0;
  // Construct ISO string
  const iso = `${dateStr}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
  return new Date(iso);
}
