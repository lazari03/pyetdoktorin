import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { UserRole } from '@/domain/entities/UserRole';

export type PrescriptionStatus = 'pending' | 'accepted' | 'rejected';

export interface PrescriptionInput {
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  pharmacyId?: string;
  pharmacyName?: string;
  medicines: string[];
  dosage?: string;
  notes?: string;
  title?: string;
  signatureDataUrl?: string;
  encrypted?: boolean;
  encryptedSignature?: string;
  encryptedNotes?: string;
}

export interface Prescription extends PrescriptionInput {
  id: string;
  status: PrescriptionStatus;
  createdAt: number;
}

const COLLECTION = 'recipe';

export async function createPrescription(input: PrescriptionInput): Promise<Prescription> {
  const admin = getFirebaseAdmin();
  const payload = {
    ...input,
    status: 'pending' as PrescriptionStatus,
    createdAt: Date.now(),
  };
  const ref = await admin.firestore().collection(COLLECTION).add(payload);
  return { ...(payload as Prescription), id: ref.id };
}

export async function listPrescriptionsForRole(uid: string, role: UserRole): Promise<Prescription[]> {
  const admin = getFirebaseAdmin();
  let query = admin.firestore().collection(COLLECTION).orderBy('createdAt', 'desc');
  if (role === UserRole.Doctor) {
    query = query.where('doctorId', '==', uid);
  } else if (role === UserRole.Patient) {
    query = query.where('patientId', '==', uid);
  } else if (role === UserRole.Pharmacy) {
    query = query.where('pharmacyId', '==', uid);
  }
  const snapshot = await query.limit(200).get();
  return snapshot.docs.map((doc) => ({ ...(doc.data() as Prescription), id: doc.id }));
}

export async function updatePrescriptionStatus(id: string, status: PrescriptionStatus): Promise<void> {
  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    throw new Error('Invalid prescription status');
  }
  const admin = getFirebaseAdmin();
  await admin.firestore().collection(COLLECTION).doc(id).set({ status }, { merge: true });
}
