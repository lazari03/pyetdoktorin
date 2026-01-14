import type { Appointment } from '@/domain/entities/Appointment';
import type { AppointmentStatus } from '@/domain/entities/AppointmentStatus';
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
      doctorId: data.doctorId as string,
      doctorName: data.doctorName as string,
      patientId: data.patientId as string,
      patientName: data.patientName as string | undefined,
      appointmentType: data.appointmentType as string,
      preferredDate: data.preferredDate as string,
      preferredTime: data.preferredTime as string,
      notes: data.notes as string,
      isPaid: Boolean(data.isPaid),
      createdAt: data.createdAt as string,
  status: data.status as AppointmentStatus,
      roomId: data.roomId as string | undefined,
      roomCode: data.roomCode as string | undefined,
      dismissedBy: data.dismissedBy as Record<string, boolean> | undefined,
    };
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
      doctorId: data.doctorId as string,
      doctorName: data.doctorName as string,
      patientId: data.patientId as string,
      patientName: data.patientName as string | undefined,
      appointmentType: data.appointmentType as string,
      preferredDate: data.preferredDate as string,
      preferredTime: data.preferredTime as string,
      notes: data.notes as string,
      isPaid: Boolean(data.isPaid),
      createdAt: data.createdAt as string,
  status: data.status as AppointmentStatus,
      roomId: data.roomId as string | undefined,
      roomCode: data.roomCode as string | undefined,
      dismissedBy: data.dismissedBy as Record<string, boolean> | undefined,
    };
  });
}
