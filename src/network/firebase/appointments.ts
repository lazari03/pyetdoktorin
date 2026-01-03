import type { Appointment } from '@/domain/models/Appointment';
import { db } from '@/config/firebaseconfig';
import { FirestoreCollections } from '@/models/FirestoreConstants';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function fetchAppointmentsForUser(id: string): Promise<Appointment[]> {
  const col = collection(db, FirestoreCollections.Appointments);
  const q = query(col, where('userId', '==', id));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      userId: data.userId as string,
      doctorId: data.doctorId as string,
      timestamp: Number(data.timestamp as number) || 0,
    } satisfies Appointment;
  });
}

export async function fetchAppointmentsForDoctor(id: string): Promise<Appointment[]> {
  const col = collection(db, FirestoreCollections.Appointments);
  const q = query(col, where('doctorId', '==', id));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      userId: data.userId as string,
      doctorId: data.doctorId as string,
      timestamp: Number(data.timestamp as number) || 0,
    } satisfies Appointment;
  });
}
