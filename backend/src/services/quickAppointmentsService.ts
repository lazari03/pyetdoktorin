import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { UserRole } from '@/domain/entities/UserRole';
import { getResolvedAvailabilityForDoctor } from '@/services/availabilityService';
import { listAppointmentsForUser } from '@/services/appointmentsService';

export interface QuickAppointmentMatch {
  doctorId: string;
  doctorName: string;
  specialties: string[];
  profilePicture?: string;
  nextAvailableAt: string;
  nextAvailableDate: string;
  nextAvailableTime: string;
  nextAvailableInMinutes: number;
  availableNow: boolean;
  hasPreviousMeetings: boolean;
  previousMeetingsCount: number;
}

export interface QuickAppointmentResponse {
  items: QuickAppointmentMatch[];
  specialties: string[];
  total: number;
  preferredDate: string;
  preferredTime: string;
}

export interface QuickAppointmentQuery {
  patientId: string;
  specialty?: string;
  preferredDate?: string;
  preferredTime?: string;
  limit?: number;
  horizonDays?: number;
}

type PublicDoctorProfile = {
  id: string;
  name: string;
  specialization: string[];
  profilePicture?: string;
  bio?: string;
};

const DEFAULT_HORIZON_DAYS = 7;
const MIN_ALERT_LEAD_MINUTES = 10;
const AVAILABLE_NOW_MAX_MINUTES = 15;

function normalizeSpecializations(data: Record<string, unknown>): string[] {
  if (Array.isArray(data.specializations)) {
    return data.specializations.filter(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    );
  }
  if (typeof data.specialization === 'string' && data.specialization.trim().length > 0) {
    return [data.specialization];
  }
  return [];
}

function mapDoctorDoc(id: string, data: Record<string, unknown>): PublicDoctorProfile | null {
  const role = typeof data.role === 'string' ? data.role.toLowerCase() : '';
  if (role !== 'doctor') {
    return null;
  }
  const approvalStatus = typeof data.approvalStatus === 'string' ? data.approvalStatus.toLowerCase() : undefined;
  if (approvalStatus && approvalStatus !== 'approved') {
    return null;
  }
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) {
    return null;
  }

  const profile: PublicDoctorProfile = {
    id,
    name,
    specialization: normalizeSpecializations(data),
  };

  if (typeof data.profilePicture === 'string' && data.profilePicture.trim().length > 0) {
    profile.profilePicture = data.profilePicture;
  }

  if (typeof data.bio === 'string' && data.bio.trim().length > 0) {
    profile.bio = data.bio;
  }

  return profile;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseTimeToMinutes(value?: string): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  const simpleMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (simpleMatch) {
    const hours = Number(simpleMatch[1]);
    const minutes = Number(simpleMatch[2]);
    if (!Number.isNaN(hours) && !Number.isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return hours * 60 + minutes;
    }
  }
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = Number(ampmMatch[2]);
    const periodPart = ampmMatch[3];
    if (!periodPart) return null;
    const period = periodPart.toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  return null;
}

function matchesSpecialty(specialties: string[], specialty?: string): boolean {
  if (!specialty || specialty.trim().length === 0) {
    return true;
  }
  const normalized = specialty.trim().toLowerCase();
  return specialties.some((value) => value.toLowerCase().includes(normalized));
}

async function listApprovedDoctors(): Promise<PublicDoctorProfile[]> {
  const admin = getFirebaseAdmin();
  const snapshot = await admin.firestore().collection('users').where('role', '==', 'doctor').get();
  return snapshot.docs
    .map((doc) => mapDoctorDoc(doc.id, doc.data() as Record<string, unknown>))
    .filter((doctor): doctor is PublicDoctorProfile => Boolean(doctor));
}

export async function findQuickAppointmentMatches(query: QuickAppointmentQuery): Promise<QuickAppointmentResponse> {
  const { patientId, specialty, preferredDate, preferredTime, limit = 5, horizonDays = DEFAULT_HORIZON_DAYS } = query;
  const now = new Date();
  const fallbackDate = toIsoDate(now);
  const startDateInput = preferredDate ?? fallbackDate;
  const parsedStartDate = new Date(`${startDateInput}T00:00:00`);
  const startDate = Number.isNaN(parsedStartDate.getTime()) ? new Date(`${fallbackDate}T00:00:00`) : parsedStartDate;
  const requestedMinutes = parseTimeToMinutes(preferredTime);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const minStartMinutes = nowMinutes + MIN_ALERT_LEAD_MINUTES;
  const startDateIso = toIsoDate(startDate);
  const startMinutes = startDateIso === fallbackDate
    ? Math.max(requestedMinutes ?? minStartMinutes, minStartMinutes)
    : (requestedMinutes ?? 0);
  const patientAppointments = await listAppointmentsForUser(patientId, UserRole.Patient);
  const previousMeetingsByDoctor = new Map<string, number>();

  patientAppointments.forEach((appointment) => {
    if (!appointment.doctorId) return;
    if (appointment.status === 'rejected') return;
    previousMeetingsByDoctor.set(appointment.doctorId, (previousMeetingsByDoctor.get(appointment.doctorId) ?? 0) + 1);
  });

  const doctors = await listApprovedDoctors();
  const specialtyCatalog = Array.from(new Set(doctors.flatMap((doctor) => doctor.specialization))).sort((a, b) => a.localeCompare(b));

  const matches: QuickAppointmentMatch[] = [];

  for (const doctor of doctors) {
    if (!matchesSpecialty(doctor.specialization, specialty)) {
      continue;
    }

    let match: QuickAppointmentMatch | null = null;
    for (let dayOffset = 0; dayOffset < horizonDays; dayOffset += 1) {
      const date = addDays(startDate, dayOffset);
      const dateString = toIsoDate(date);
      const slots = await getResolvedAvailabilityForDoctor(doctor.id, dateString);
      const availableSlot = slots.find((slot) => {
        if (slot.booked || slot.past) return false;
        const slotMinutes = parseTimeToMinutes(slot.time);
        if (dayOffset === 0 && slotMinutes !== null) {
          return slotMinutes >= startMinutes;
        }
        return true;
      });

      if (!availableSlot) {
        continue;
      }

      const nextSlotDate = new Date(`${dateString}T${availableSlot.time}:00`);
      const nextAvailableInMinutes = Math.max(0, Math.round((nextSlotDate.getTime() - now.getTime()) / 60000));
      if (nextAvailableInMinutes < MIN_ALERT_LEAD_MINUTES) {
        continue;
      }
      const previousMeetingsCount = previousMeetingsByDoctor.get(doctor.id) ?? 0;

      match = {
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialties: doctor.specialization,
        nextAvailableAt: nextSlotDate.toISOString(),
        nextAvailableDate: dateString,
        nextAvailableTime: availableSlot.time,
        nextAvailableInMinutes,
        availableNow: nextAvailableInMinutes >= MIN_ALERT_LEAD_MINUTES && nextAvailableInMinutes <= AVAILABLE_NOW_MAX_MINUTES,
        hasPreviousMeetings: previousMeetingsCount > 0,
        previousMeetingsCount,
      };
      if (doctor.profilePicture) {
        match.profilePicture = doctor.profilePicture;
      }
      break;
    }

    if (match) {
      matches.push(match);
    }
  }

  matches.sort((left, right) => {
    if (left.nextAvailableInMinutes !== right.nextAvailableInMinutes) {
      return left.nextAvailableInMinutes - right.nextAvailableInMinutes;
    }
    if (left.hasPreviousMeetings !== right.hasPreviousMeetings) {
      return Number(left.hasPreviousMeetings) - Number(right.hasPreviousMeetings);
    }
    if (left.previousMeetingsCount !== right.previousMeetingsCount) {
      return right.previousMeetingsCount - left.previousMeetingsCount;
    }
    return left.doctorName.localeCompare(right.doctorName);
  });

  return {
    items: matches.slice(0, limit),
    specialties: specialtyCatalog,
    total: matches.length,
    preferredDate: preferredDate ?? startDateIso,
    preferredTime: preferredTime ?? `${String(Math.floor(startMinutes / 60)).padStart(2, '0')}:${String(startMinutes % 60).padStart(2, '0')}`,
  };
}