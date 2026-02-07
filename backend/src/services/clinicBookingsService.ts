import { getFirebaseAdmin } from '@/config/firebaseAdmin';

export type ClinicBookingStatus = 'pending' | 'confirmed' | 'declined';

export interface ClinicBookingInput {
  clinicId: string;
  clinicName: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  note: string;
  preferredDate?: string;
}

export interface ClinicBooking extends ClinicBookingInput {
  id: string;
  status: ClinicBookingStatus;
  createdAt: string;
}

const COLLECTION = 'clinicBookings';

export async function createClinicBooking(input: ClinicBookingInput): Promise<ClinicBooking> {
  const admin = getFirebaseAdmin();
  const payload = {
    ...input,
    status: 'pending' as ClinicBookingStatus,
    createdAt: new Date().toISOString(),
  };
  const ref = await admin.firestore().collection(COLLECTION).add(payload);
  return { ...(payload as ClinicBooking), id: ref.id };
}

export async function listBookingsByClinic(clinicId: string): Promise<ClinicBooking[]> {
  const admin = getFirebaseAdmin();
  const snapshot = await admin.firestore().collection(COLLECTION).where('clinicId', '==', clinicId).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => ({ ...(doc.data() as ClinicBooking), id: doc.id }));
}

export async function listBookingsByPatient(patientId: string): Promise<ClinicBooking[]> {
  const admin = getFirebaseAdmin();
  const snapshot = await admin.firestore().collection(COLLECTION).where('patientId', '==', patientId).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => ({ ...(doc.data() as ClinicBooking), id: doc.id }));
}

export async function listAllBookings(limit = 500): Promise<ClinicBooking[]> {
  const admin = getFirebaseAdmin();
  const snapshot = await admin.firestore().collection(COLLECTION).orderBy('createdAt', 'desc').limit(limit).get();
  return snapshot.docs.map((doc) => ({ ...(doc.data() as ClinicBooking), id: doc.id }));
}

export async function updateClinicBookingStatus(id: string, status: ClinicBookingStatus): Promise<void> {
  if (!['pending', 'confirmed', 'declined'].includes(status)) {
    throw new Error('Invalid clinic booking status');
  }
  const admin = getFirebaseAdmin();
  await admin.firestore().collection(COLLECTION).doc(id).set({ status }, { merge: true });
}

export async function getClinicBookingById(id: string): Promise<ClinicBooking | null> {
  const admin = getFirebaseAdmin();
  const doc = await admin.firestore().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { ...(doc.data() as ClinicBooking), id: doc.id };
}
