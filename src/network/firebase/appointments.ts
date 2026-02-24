import type { Appointment } from '@/domain/entities/Appointment';
import type { AppointmentStatus } from '@/domain/entities/AppointmentStatus';
import { db } from '@/config/firebaseconfig';
import { FirestoreCollections } from '@/models/FirestoreConstants';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';

export async function fetchAppointmentsForUser(id: string): Promise<Appointment[]> {
  const col = collection(db, FirestoreCollections.Appointments);
  const q = query(col, where('patientId', '==', id));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapAppointmentDoc(d.id, d.data() as Record<string, unknown>));
}

export async function fetchAppointmentsForDoctor(id: string): Promise<Appointment[]> {
  const col = collection(db, FirestoreCollections.Appointments);
  const q = query(col, where('doctorId', '==', id));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapAppointmentDoc(d.id, d.data() as Record<string, unknown>));
}

export function subscribeAppointmentsForUser(
  id: string,
  onChange: (appointments: Appointment[]) => void
): () => void {
  const col = collection(db, FirestoreCollections.Appointments);
  const q = query(col, where('patientId', '==', id));
  const unsubscribe = onSnapshot(q, (snap) => {
    const items = snap.docs.map((doc) => mapAppointmentDoc(doc.id, doc.data() as Record<string, unknown>));
    onChange(items);
  });
  return () => unsubscribe();
}

export function subscribeAppointmentsForDoctor(
  id: string,
  onChange: (appointments: Appointment[]) => void
): () => void {
  const col = collection(db, FirestoreCollections.Appointments);
  const q = query(col, where('doctorId', '==', id));
  const unsubscribe = onSnapshot(q, (snap) => {
    const items = snap.docs.map((doc) => mapAppointmentDoc(doc.id, doc.data() as Record<string, unknown>));
    onChange(items);
  });
  return () => unsubscribe();
}

function mapAppointmentDoc(id: string, data: Record<string, unknown>): Appointment {
  return {
    id,
    doctorId: data.doctorId as string,
    doctorName: data.doctorName as string,
    patientId: data.patientId as string,
    patientName: data.patientName as string | undefined,
    appointmentType: data.appointmentType as string,
    preferredDate: data.preferredDate as string,
    preferredTime: data.preferredTime as string,
    notes: (data.notes ?? data.note ?? '') as string,
    isPaid: Boolean(data.isPaid),
    paymentStatus: data.paymentStatus as string | undefined,
    createdAt: data.createdAt as string,
    status: data.status as AppointmentStatus,
    roomId: data.roomId as string | undefined,
    roomCode: data.roomCode as string | undefined,
    dismissedBy: data.dismissedBy as Record<string, boolean> | undefined,
  };
}
