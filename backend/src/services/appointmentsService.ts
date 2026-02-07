import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { UserRole } from '@/domain/entities/UserRole';

export type AppointmentStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface AppointmentInput {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentType?: string;
  preferredDate: string;
  preferredTime?: string;
  note?: string;
}

export interface Appointment extends AppointmentInput {
  id: string;
  status: AppointmentStatus;
  isPaid: boolean;
  createdAt: number;
}

const COLLECTION = 'appointments';

export async function listAppointmentsForUser(uid: string, role: UserRole): Promise<Appointment[]> {
  const admin = getFirebaseAdmin();
  const db = admin.firestore();
  let query = db.collection(COLLECTION).orderBy('createdAt', 'desc').limit(200);
  if (role === UserRole.Patient) {
    query = query.where('patientId', '==', uid);
  } else if (role === UserRole.Doctor) {
    query = query.where('doctorId', '==', uid);
  } else if (role === UserRole.Clinic) {
    query = query.where('clinicId', '==', uid);
  }
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ ...(doc.data() as Appointment), id: doc.id }));
}

export async function createAppointment(input: AppointmentInput): Promise<Appointment> {
  const admin = getFirebaseAdmin();
  const db = admin.firestore();
  const payload = {
    ...input,
    status: 'pending' as AppointmentStatus,
    isPaid: false,
    createdAt: Date.now(),
  };
  const ref = await db.collection(COLLECTION).add(payload);
  return { id: ref.id, ...payload };
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const admin = getFirebaseAdmin();
  const doc = await admin.firestore().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { ...(doc.data() as Appointment), id: doc.id };
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus, actor: UserRole): Promise<void> {
  if (!['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
    throw new Error('Invalid status');
  }
  const admin = getFirebaseAdmin();
  const updates: Record<string, unknown> = { status };
  if (status === 'accepted' && actor === UserRole.Doctor) {
    updates.confirmedAt = Date.now();
  }
  await admin.firestore().collection(COLLECTION).doc(id).set(updates, { merge: true });
}

export async function markAppointmentPaid(id: string, transactionId: string): Promise<void> {
  const admin = getFirebaseAdmin();
  await admin.firestore().collection(COLLECTION).doc(id).set({
    isPaid: true,
    paymentStatus: 'paid',
    transactionId,
    paidAt: Date.now(),
  }, { merge: true });
}
