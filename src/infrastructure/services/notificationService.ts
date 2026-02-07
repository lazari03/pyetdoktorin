import { db } from '@/config/firebaseconfig';
// import { auth } from '@/config/firebaseconfig';
import { doc, getDoc, collection, updateDoc } from 'firebase/firestore';
import { Appointment } from '@/domain/entities/Appointment';

function normalizePreferredDate(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    const date = (value as { toDate: () => Date }).toDate();
    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }
  return '';
}

export async function getUserRole(userId: string): Promise<string | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data().role : null;
}

export async function fetchAppointmentDetails(appointments: Appointment[]): Promise<Array<{ id: string; patientName: string | null; doctorName: string | null; preferredDate: string; notes: string }>> {
  return Promise.all(
    appointments.map(async (appointment) => {
      try {
        const appointmentRef = doc(collection(db, 'appointments'), appointment.id);
        const appointmentSnap = await getDoc(appointmentRef);
        if (!appointmentSnap.exists()) throw new Error('Appointment not found');
        const { patientId, doctorId, preferredDate, notes, note } = appointmentSnap.data() as Record<string, unknown>;
        let patientName: string | null = null;
        let doctorName: string | null = null;
        if (typeof patientId === 'string' && patientId) {
          const patientRef = doc(collection(db, 'users'), patientId);
          const patientSnap = await getDoc(patientRef);
          if (patientSnap.exists()) patientName = patientSnap.data().name;
        }
        if (typeof doctorId === 'string' && doctorId) {
          const doctorRef = doc(collection(db, 'users'), doctorId);
          const doctorSnap = await getDoc(doctorRef);
          if (doctorSnap.exists()) doctorName = doctorSnap.data().name;
        }
        return {
          id: appointment.id,
          patientName,
          doctorName,
          preferredDate: normalizePreferredDate(preferredDate),
          notes: (notes as string) || (note as string) || '',
        };
      } catch {
        return { id: appointment.id, patientName: null, doctorName: null, preferredDate: '', notes: '' };
      }
    })
  );
}

export async function dismissNotification(appointmentId: string, userId: string) {
  const appointmentRef = doc(collection(db, 'appointments'), appointmentId);
  await updateDoc(appointmentRef, { [`dismissedBy.${userId}`]: true });
}
