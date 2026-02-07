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
  notes?: string;
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
  const baseCollection = db.collection(COLLECTION);
  let filteredQuery = baseCollection;
  if (role === UserRole.Patient) {
    filteredQuery = filteredQuery.where('patientId', '==', uid);
  } else if (role === UserRole.Doctor) {
    filteredQuery = filteredQuery.where('doctorId', '==', uid);
  } else if (role === UserRole.Clinic) {
    filteredQuery = filteredQuery.where('clinicId', '==', uid);
  }
  const mapDocs = (docs: FirebaseFirestore.QueryDocumentSnapshot[]) =>
    docs.map((doc) => {
      const data = doc.data() as Appointment & { note?: string; notes?: string };
      const normalizedNotes = data.notes ?? data.note;
      const base = { ...data, id: doc.id } as Appointment;
      if (normalizedNotes !== undefined) {
        base.notes = normalizedNotes;
      }
      return base;
    });

  try {
    const snapshot = await filteredQuery.orderBy('createdAt', 'desc').limit(200).get();
    return mapDocs(snapshot.docs);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    // Fallback for missing composite index in dev/preview environments.
    if (message.toLowerCase().includes('index')) {
      const snapshot = await filteredQuery.limit(200).get();
      const items = mapDocs(snapshot.docs);
      return items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }
    throw error;
  }
}

export async function createAppointment(input: AppointmentInput): Promise<Appointment> {
  const admin = getFirebaseAdmin();
  const db = admin.firestore();
  const { note, notes, ...rest } = input;
  const normalizedNotes = notes ?? note;
  const payload: Omit<Appointment, 'id'> = {
    ...rest,
    status: 'pending' as AppointmentStatus,
    isPaid: false,
    createdAt: Date.now(),
  };
  if (normalizedNotes !== undefined) {
    payload.note = normalizedNotes;
    payload.notes = normalizedNotes;
  }
  const ref = await db.collection(COLLECTION).add(payload);
  return { id: ref.id, ...payload };
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const admin = getFirebaseAdmin();
  const doc = await admin.firestore().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data() as Appointment & { note?: string; notes?: string };
  const normalizedNotes = data.notes ?? data.note;
  const base = { ...data, id: doc.id } as Appointment;
  if (normalizedNotes !== undefined) {
    base.notes = normalizedNotes;
  }
  return base;
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
