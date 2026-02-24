import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { UserRole } from '@/domain/entities/UserRole';
import {
  AppointmentNotFoundError,
  InvalidAppointmentStatusError,
  PaymentNotAllowedError,
  PreferredTimeRequiredError,
  SlotAlreadyBookedError,
} from '@/errors/appointmentErrors';

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
const SLOT_COLLECTION = 'appointmentSlots';

const normalizeStatus = (status?: string): AppointmentStatus => {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'finished') return 'completed';
  if (normalized === 'declined') return 'rejected';
  if (normalized === 'canceled' || normalized === 'cancelled') return 'rejected';
  if (normalized === 'completed' || normalized === 'accepted' || normalized === 'rejected' || normalized === 'pending') {
    return normalized as AppointmentStatus;
  }
  return 'pending';
};

const buildSlotId = (doctorId: string, preferredDate: string, preferredTime: string) => {
  const raw = `${doctorId}__${preferredDate}__${preferredTime}`;
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_');
};

export async function listAppointmentsForUser(uid: string, role: UserRole): Promise<Appointment[]> {
  const admin = getFirebaseAdmin();
  const db = admin.firestore();
  const baseCollection = db.collection(COLLECTION);
  let filteredQuery: FirebaseFirestore.Query = baseCollection;
  if (role === UserRole.Patient) {
    filteredQuery = filteredQuery.where('patientId', '==', uid);
  } else if (role === UserRole.Doctor) {
    filteredQuery = filteredQuery.where('doctorId', '==', uid);
  } else if (role === UserRole.Clinic) {
    filteredQuery = filteredQuery.where('clinicId', '==', uid);
  }
  const mapDocs = (docs: FirebaseFirestore.QueryDocumentSnapshot[]) =>
    docs.map((doc) => {
      const data = doc.data() as Appointment & { note?: string; notes?: string; status?: string };
      const normalizedNotes = data.notes ?? data.note;
      const base = { ...data, id: doc.id, status: normalizeStatus(data.status) } as Appointment;
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
  if (!rest.preferredTime) {
    throw new PreferredTimeRequiredError();
  }
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
  const slotId = buildSlotId(rest.doctorId, rest.preferredDate, rest.preferredTime);
  const appointmentRef = db.collection(COLLECTION).doc();
  const slotRef = db.collection(SLOT_COLLECTION).doc(slotId);
  await db.runTransaction(async (tx) => {
    const slotSnap = await tx.get(slotRef);
    if (slotSnap.exists) {
      throw new SlotAlreadyBookedError();
    }
    tx.set(slotRef, {
      appointmentId: appointmentRef.id,
      doctorId: rest.doctorId,
      preferredDate: rest.preferredDate,
      preferredTime: rest.preferredTime,
      createdAt: Date.now(),
    });
    tx.set(appointmentRef, { ...payload, slotId });
  });
  return { id: appointmentRef.id, ...payload };
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const admin = getFirebaseAdmin();
  const doc = await admin.firestore().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data() as Appointment & { note?: string; notes?: string; status?: string };
  const normalizedNotes = data.notes ?? data.note;
  const base = { ...data, id: doc.id, status: normalizeStatus(data.status) } as Appointment;
  if (normalizedNotes !== undefined) {
    base.notes = normalizedNotes;
  }
  return base;
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus, actor: UserRole): Promise<void> {
  const normalizedStatus = normalizeStatus(status);
  if (!['pending', 'accepted', 'rejected', 'completed'].includes(normalizedStatus)) {
    throw new InvalidAppointmentStatusError();
  }
  const admin = getFirebaseAdmin();
  const db = admin.firestore();
  await db.runTransaction(async (tx) => {
    const appointmentRef = db.collection(COLLECTION).doc(id);
    const appointmentSnap = await tx.get(appointmentRef);
    if (!appointmentSnap.exists) {
      throw new AppointmentNotFoundError();
    }
    const appointment = appointmentSnap.data() as Appointment & { slotId?: string };
    const updates: Record<string, unknown> = { status: normalizedStatus };
    if (normalizedStatus === 'accepted' && actor === UserRole.Doctor) {
      updates.confirmedAt = Date.now();
    }
    tx.set(appointmentRef, updates, { merge: true });
    if (['rejected', 'completed'].includes(normalizedStatus)) {
      const slotId = appointment.slotId;
      if (slotId) {
        const slotRef = db.collection(SLOT_COLLECTION).doc(slotId);
        tx.delete(slotRef);
      }
    }
  });
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

export async function markAppointmentPaymentProcessing(
  id: string,
  actor: { uid: string; role: UserRole }
): Promise<void> {
  const admin = getFirebaseAdmin();
  const db = admin.firestore();
  await db.runTransaction(async (tx) => {
    const appointmentRef = db.collection(COLLECTION).doc(id);
    const appointmentSnap = await tx.get(appointmentRef);
    if (!appointmentSnap.exists) {
      throw new AppointmentNotFoundError();
    }
    const appointment = appointmentSnap.data() as Appointment;
    if (actor.role === UserRole.Patient && appointment.patientId !== actor.uid) {
      throw new PaymentNotAllowedError();
    }
    if (appointment.status !== 'accepted') {
      throw new PaymentNotAllowedError();
    }
    if (appointment.isPaid) {
      return;
    }
    tx.set(appointmentRef, {
      paymentStatus: 'processing',
      paymentProvider: 'paddle',
      paymentStartedAt: Date.now(),
    }, { merge: true });
  });
}
