import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { env } from '@/config/env';
import { UserRole } from '@/domain/entities/UserRole';
import { canListAppointmentsForRole } from '@/domain/rules/userRoleRules';
import { createUserNotification } from '@/services/userNotificationsService';
import { notifyAdmins } from '@/services/adminAlertsService';
import {
  AppointmentNotFoundError,
  InvalidAppointmentStatusError,
  PaymentNotAllowedError,
  PreferredTimeRequiredError,
  SlotAlreadyBookedError,
} from '@/errors/appointmentErrors';

export type AppointmentStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface AppointmentInput {
  patientId?: string;
  patientName: string;
  requesterId: string;
  requesterName?: string;
  payerId?: string;
  familyMemberId?: string;
  doctorId: string;
  doctorName: string;
  appointmentType?: string;
  preferredDate: string;
  preferredTime?: string;
  note?: string;
  notes?: string;
  feeAmount?: number;
  feeCurrency?: string;
}

export interface Appointment extends AppointmentInput {
  id: string;
  status: AppointmentStatus;
  isPaid: boolean;
  createdAt: number;
  paymentStatus?: string;
  paymentStartedAt?: number;
  paymentProvider?: string;
  transactionId?: string;
  paidAt?: number;
}

const COLLECTION = 'appointments';
const SLOT_COLLECTION = 'appointmentSlots';

function getAppointmentQueryForRole(
  baseCollection: FirebaseFirestore.CollectionReference,
  uid: string,
  role: UserRole,
): FirebaseFirestore.Query {
  if (!canListAppointmentsForRole(role)) {
    throw new Error(`Unsupported appointment role: ${role}`);
  }
  switch (role) {
    case UserRole.Admin:
      return baseCollection;
    case UserRole.Patient:
      return baseCollection.where('patientId', '==', uid);
    case UserRole.Doctor:
      return baseCollection.where('doctorId', '==', uid);
    default:
      throw new Error(`Unsupported appointment role: ${role}`);
  }
}

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

export const normalizePreferredTime = (preferredTime: string): string => {
  const trimmed = preferredTime.trim();
  const simpleMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (simpleMatch) {
    const [, hoursPart, minutesPart] = simpleMatch;
    if (!hoursPart || !minutesPart) {
      return trimmed;
    }
    const hours = Number(hoursPart);
    const minutes = Number(minutesPart);
    if (!Number.isNaN(hours) && !Number.isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }

  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (ampmMatch) {
    const [, hoursPart, minutesPart, periodPart] = ampmMatch;
    if (!hoursPart || !minutesPart || !periodPart) {
      return trimmed;
    }
    let hours = Number(hoursPart);
    const minutes = Number(minutesPart);
    const period = periodPart.toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  return trimmed;
};

const buildSlotId = (doctorId: string, preferredDate: string, preferredTime: string) => {
  const raw = `${doctorId}__${preferredDate}__${normalizePreferredTime(preferredTime)}`;
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_');
};

function mapAppointmentDocs(docs: FirebaseFirestore.QueryDocumentSnapshot[]): Appointment[] {
  return docs.map((doc) => {
    const data = doc.data() as Appointment & { note?: string; notes?: string; status?: string };
    const normalizedNotes = data.notes ?? data.note;
    const base = { ...data, id: doc.id, status: normalizeStatus(data.status) } as Appointment;
    if (normalizedNotes !== undefined) {
      base.notes = normalizedNotes;
    }
    return base;
  });
}

async function runAppointmentQuery(query: FirebaseFirestore.Query): Promise<Appointment[]> {
  try {
    const snapshot = await query.orderBy('createdAt', 'desc').limit(200).get();
    return mapAppointmentDocs(snapshot.docs);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    // Fallback for missing composite index in dev/preview environments.
    if (message.toLowerCase().includes('index')) {
      const snapshot = await query.limit(200).get();
      const items = mapAppointmentDocs(snapshot.docs);
      return items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }
    throw error;
  }
}

export async function listAppointmentsForUser(uid: string, role: UserRole): Promise<Appointment[]> {
  const admin = getFirebaseAdmin();
  const db = admin.firestore();
  const baseCollection = db.collection(COLLECTION);

  if (role === UserRole.Patient) {
    // A family member with no account of their own has no patientId match —
    // only requesterId does — so both queries are merged here rather than
    // relying on a single field filter.
    const [asPatient, asRequester] = await Promise.all([
      runAppointmentQuery(baseCollection.where('patientId', '==', uid)),
      runAppointmentQuery(baseCollection.where('requesterId', '==', uid)),
    ]);
    const byId = new Map<string, Appointment>();
    for (const appointment of [...asPatient, ...asRequester]) {
      byId.set(appointment.id, appointment);
    }
    return Array.from(byId.values()).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  const filteredQuery = getAppointmentQueryForRole(baseCollection, uid, role);
  return runAppointmentQuery(filteredQuery);
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

  try {
    await createUserNotification({
      userId: rest.doctorId,
      type: 'appointment_requested',
      title: 'New appointment request',
      body: `${rest.patientName || 'A patient'} requested an appointment on ${rest.preferredDate} at ${rest.preferredTime}.`,
      metadata: { appointmentId: appointmentRef.id },
    });
  } catch (error) {
    console.error('Failed to create new-booking notification:', error);
  }

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

/**
 * Appointments booked before fee-snapshotting existed have no feeAmount at
 * all. Backfills a sensible default (once) so they remain payable rather
 * than permanently stuck — never overwrites an already-stored fee.
 */
export async function ensureAppointmentFee(
  id: string,
  feeAmount: number,
  feeCurrency: string,
): Promise<{ feeAmount: number; feeCurrency: string }> {
  const admin = getFirebaseAdmin();
  const ref = admin.firestore().collection(COLLECTION).doc(id);
  await ref.set({ feeAmount, feeCurrency }, { merge: true });
  return { feeAmount, feeCurrency };
}

const APPOINTMENT_STATUS_NOTIFICATION_COPY: Partial<Record<AppointmentStatus, { title: string; body: string }>> = {
  accepted: { title: 'Appointment accepted', body: 'Your appointment has been accepted by the doctor.' },
  rejected: { title: 'Appointment rejected', body: 'Your appointment request was declined by the doctor.' },
  completed: { title: 'Appointment completed', body: 'Your appointment has been marked as completed.' },
};

export async function updateAppointmentStatus(id: string, status: AppointmentStatus, actor: UserRole): Promise<void> {
  const normalizedStatus = normalizeStatus(status);
  if (!['pending', 'accepted', 'rejected', 'completed'].includes(normalizedStatus)) {
    throw new InvalidAppointmentStatusError();
  }
  const admin = getFirebaseAdmin();
  const db = admin.firestore();
  let requesterId: string | undefined;
  let patientName: string | undefined;
  let doctorName: string | undefined;
  await db.runTransaction(async (tx) => {
    const appointmentRef = db.collection(COLLECTION).doc(id);
    const appointmentSnap = await tx.get(appointmentRef);
    if (!appointmentSnap.exists) {
      throw new AppointmentNotFoundError();
    }
    const appointment = appointmentSnap.data() as Appointment & { slotId?: string };
    requesterId = appointment.requesterId;
    patientName = appointment.patientName;
    doctorName = appointment.doctorName;
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

  const copy = APPOINTMENT_STATUS_NOTIFICATION_COPY[normalizedStatus];
  if (copy && requesterId) {
    try {
      await createUserNotification({
        userId: requesterId,
        type: `appointment_${normalizedStatus}`,
        title: copy.title,
        body: copy.body,
        metadata: { appointmentId: id },
      });
    } catch (error) {
      console.error('Failed to create appointment status notification:', error);
    }
  }

  if (normalizedStatus === 'accepted' || normalizedStatus === 'rejected') {
    void notifyAdmins(
      `appointment_${normalizedStatus}_admin`,
      normalizedStatus === 'accepted' ? 'Appointment accepted' : 'Appointment declined',
      `${doctorName || 'A doctor'} ${normalizedStatus} the appointment with ${patientName || 'a patient'}.`,
      { appointmentId: id },
    );
  }
}

const PAYMENTS_COLLECTION = 'payments';
const DOCTOR_PAYOUTS_COLLECTION = 'doctorPayouts';

/**
 * You remain the merchant of record — the patient's payment always lands in
 * your own account first, in full. This just computes and records what you
 * owe the doctor vs. what you keep, so there's a real ledger to pay out
 * against (manually, or via a batch payout run) instead of only aggregate
 * estimates shown in the UI.
 */
function splitAppointmentFee(feeAmount: number): { doctorPayoutAmount: number; platformFee: number } {
  const rate = Math.min(Math.max(env.doctorPayoutPercentage, 0), 100) / 100;
  const doctorPayoutAmount = Math.round(feeAmount * rate * 100) / 100;
  const platformFee = Math.round((feeAmount - doctorPayoutAmount) * 100) / 100;
  return { doctorPayoutAmount, platformFee };
}

/**
 * Idempotent via the payments/{transactionId} ledger doc: safe to call twice
 * for the same transaction (e.g. once from the synchronous capture response,
 * once again from the webhook reconciliation backup).
 */
export async function markAppointmentPaid(
  id: string,
  transactionId: string,
  provider: string,
  status?: string,
): Promise<void> {
  const admin = getFirebaseAdmin();
  const db = admin.firestore();
  let newlyPaidAppointment: Appointment | null = null;
  await db.runTransaction(async (tx) => {
    const appointmentRef = db.collection(COLLECTION).doc(id);
    const paymentRef = db.collection(PAYMENTS_COLLECTION).doc(transactionId);
    const [appointmentSnap, paymentSnap] = await Promise.all([tx.get(appointmentRef), tx.get(paymentRef)]);
    if (!appointmentSnap.exists) {
      throw new AppointmentNotFoundError();
    }
    if (paymentSnap.exists) {
      return;
    }
    const appointment = appointmentSnap.data() as Appointment;
    if (appointment.isPaid) {
      return;
    }
    const feeAmount = appointment.feeAmount ?? env.appointmentPriceEur;
    const feeCurrency = appointment.feeCurrency ?? env.appointmentPriceCurrency;
    const { doctorPayoutAmount, platformFee } = splitAppointmentFee(feeAmount);
    tx.set(paymentRef, {
      appointmentId: id,
      transactionId,
      status: status ?? 'paid',
      provider,
      createdAt: Date.now(),
    });
    tx.set(appointmentRef, {
      isPaid: true,
      paymentStatus: 'paid',
      transactionId,
      paymentProvider: provider,
      paidAt: Date.now(),
    }, { merge: true });
    tx.set(db.collection(DOCTOR_PAYOUTS_COLLECTION).doc(transactionId), {
      appointmentId: id,
      doctorId: appointment.doctorId,
      transactionId,
      totalAmount: feeAmount,
      currency: feeCurrency,
      payoutAmount: doctorPayoutAmount,
      platformFee,
      status: 'pending',
      createdAt: Date.now(),
    });
    newlyPaidAppointment = appointment;
  });

  if (newlyPaidAppointment) {
    const { doctorId, patientName } = newlyPaidAppointment as Appointment;
    try {
      await createUserNotification({
        userId: doctorId,
        type: 'appointment_paid',
        title: 'Payment received',
        body: `${patientName || 'A patient'} has paid for their appointment.`,
        metadata: { appointmentId: id },
      });
    } catch (error) {
      console.error('Failed to create payment-received notification:', error);
    }
  }
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
    if (
      actor.role === UserRole.Patient &&
      appointment.requesterId !== actor.uid &&
      appointment.payerId !== actor.uid &&
      // patientId fallback: appointments booked before requesterId/payerId
      // existed (pre-family-booking) only have this field set.
      appointment.patientId !== actor.uid
    ) {
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
      paymentStartedAt: Date.now(),
    }, { merge: true });
  });
}

export async function clearAppointmentPaymentProcessing(
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
    if (
      actor.role === UserRole.Patient &&
      appointment.requesterId !== actor.uid &&
      appointment.payerId !== actor.uid &&
      appointment.patientId !== actor.uid
    ) {
      throw new PaymentNotAllowedError();
    }
    if (appointment.isPaid) {
      return;
    }
    if (appointment.paymentStatus !== 'processing') {
      return;
    }
    const del = admin.firestore.FieldValue.delete();
    tx.set(appointmentRef, {
      paymentStatus: del,
      paymentProvider: del,
      paymentStartedAt: del,
    }, { merge: true });
  });
}
