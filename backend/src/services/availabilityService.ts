import {
  createDefaultAvailability,
  normalizeAvailability,
  resolveSlotsForDate,
} from '@/domain/rules/availabilityRules';
import type { DoctorAvailability, ResolvedTimeSlot } from '@/domain/entities/DoctorAvailability';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { listAppointmentsForUser, normalizePreferredTime } from '@/services/appointmentsService';
import { listAvailabilityPresets } from '@/services/availabilityPresetsService';
import { UserRole } from '@/domain/entities/UserRole';

const COLLECTION = 'availability';

export async function getAvailabilityForDoctor(doctorId: string): Promise<DoctorAvailability> {
  const admin = getFirebaseAdmin();
  const presets = await listAvailabilityPresets();
  const snapshot = await admin.firestore().collection(COLLECTION).doc(doctorId).get();
  if (!snapshot.exists) {
    return createDefaultAvailability(doctorId, presets);
  }
  return normalizeAvailability(snapshot.data() as DoctorAvailability, doctorId, presets);
}

export async function saveAvailabilityForDoctor(
  doctorId: string,
  availability: DoctorAvailability,
): Promise<DoctorAvailability> {
  const admin = getFirebaseAdmin();
  const presets = await listAvailabilityPresets();
  const normalized = normalizeAvailability(
    {
      ...availability,
      doctorId,
      updatedAt: new Date().toISOString(),
    },
    doctorId,
    presets,
  );

  await admin.firestore().collection(COLLECTION).doc(doctorId).set(normalized, { merge: true });
  return normalized;
}

export async function getResolvedAvailabilityForDoctor(
  doctorId: string,
  date: string,
): Promise<ResolvedTimeSlot[]> {
  const availability = await getAvailabilityForDoctor(doctorId);
  const appointments = await listAppointmentsForUser(doctorId, UserRole.Doctor);
  const bookedTimes = appointments
    .filter(
      (appointment): appointment is typeof appointment & { preferredTime: string } =>
        appointment.preferredDate === date &&
        appointment.status !== 'rejected' &&
        typeof appointment.preferredTime === 'string' &&
        appointment.preferredTime.length > 0,
    )
    .map((appointment) => normalizePreferredTime(appointment.preferredTime))
    .filter((value): value is string => typeof value === 'string' && value.length > 0);

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  return resolveSlotsForDate(
    availability,
    date,
    bookedTimes,
    now.getHours() * 60 + now.getMinutes(),
    date === today,
  );
}
