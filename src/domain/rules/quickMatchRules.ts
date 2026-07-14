import type { Doctor } from '../entities/Doctor';
import type { ResolvedTimeSlot } from '../entities/DoctorAvailability';

export interface DoctorSlotCandidate {
  doctor: Doctor;
  /** Date this doctor's slots were resolved for, "YYYY-MM-DD" */
  date: string;
  slots: ResolvedTimeSlot[];
}

export interface DoctorMatch {
  doctor: Doctor;
  /** Date of the matched slot, "YYYY-MM-DD" */
  date: string;
  /** Best free slot for this doctor, "HH:MM" */
  time: string;
  /** Distance in minutes between the matched slot and the requested time, on the matched day */
  distanceMinutes: number;
  /** How many free slots the doctor has on the matched day (tiebreaker: flexibility) */
  freeSlotCount: number;
}

export function timeToMinutes(time: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time ?? '');
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function daysBetween(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000);
}

/**
 * Ranks doctors for a requested date/time. Each candidate carries the earliest
 * date on which that doctor has a free slot (found by the caller scanning
 * forward day by day), so ranking is: soonest date first, then closeness to
 * the requested time on that date, then flexibility, then name.
 */
export function rankDoctorMatches(
  candidates: DoctorSlotCandidate[],
  preferredTime: string,
  requestedDate: string,
): DoctorMatch[] {
  const target = timeToMinutes(preferredTime);
  const matches: DoctorMatch[] = [];

  for (const { doctor, date, slots } of candidates) {
    const free = slots.filter((slot) => !slot.booked && !slot.past);
    if (free.length === 0) continue;

    let best: { time: string; distance: number } | null = null;
    for (const slot of free) {
      const mins = timeToMinutes(slot.time);
      const distance =
        target === null || mins === null ? Number.MAX_SAFE_INTEGER : Math.abs(mins - target);
      if (!best || distance < best.distance) best = { time: slot.time, distance };
    }

    matches.push({
      doctor,
      date,
      time: best!.time,
      distanceMinutes: best!.distance,
      freeSlotCount: free.length,
    });
  }

  return matches.sort(
    (a, b) =>
      daysBetween(requestedDate, a.date) - daysBetween(requestedDate, b.date) ||
      a.distanceMinutes - b.distanceMinutes ||
      b.freeSlotCount - a.freeSlotCount ||
      a.doctor.name.localeCompare(b.doctor.name),
  );
}
