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
}

export interface Prescription extends PrescriptionInput {
  id: string;
  status: PrescriptionStatus;
  createdAt: number;
}

const COLLECTION = 'recipe';

export async function createPrescription(input: PrescriptionInput): Promise<Prescription> {
  const admin = getFirebaseAdmin();
  const payload: Omit<Prescription, 'id'> = {
    doctorId: input.doctorId,
    doctorName: input.doctorName,
    patientId: input.patientId,
    patientName: input.patientName,
    medicines: input.medicines,
    status: 'pending' as PrescriptionStatus,
    createdAt: Date.now(),
    ...(input.pharmacyId !== undefined ? { pharmacyId: input.pharmacyId } : {}),
    ...(input.pharmacyName !== undefined ? { pharmacyName: input.pharmacyName } : {}),
    ...(input.dosage !== undefined ? { dosage: input.dosage } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.signatureDataUrl !== undefined ? { signatureDataUrl: input.signatureDataUrl } : {}),
  };
  const ref = await admin.firestore().collection(COLLECTION).add(payload);
  return { id: ref.id, ...payload };
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
  const mapDocs = (docs: FirebaseFirestore.QueryDocumentSnapshot[]) =>
    docs.map((doc) => ({ ...(doc.data() as Prescription), id: doc.id }));

  try {
    const snapshot = await query.limit(200).get();
    return mapDocs(snapshot.docs);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    // Fallback for missing composite index in dev/preview environments.
    if (message.toLowerCase().includes('index')) {
      const base = admin.firestore().collection(COLLECTION);
      let fallbackQuery: FirebaseFirestore.Query = base;
      if (role === UserRole.Doctor) {
        fallbackQuery = fallbackQuery.where('doctorId', '==', uid);
      } else if (role === UserRole.Patient) {
        fallbackQuery = fallbackQuery.where('patientId', '==', uid);
      } else if (role === UserRole.Pharmacy) {
        fallbackQuery = fallbackQuery.where('pharmacyId', '==', uid);
      }
      const snapshot = await fallbackQuery.limit(200).get();
      const items = mapDocs(snapshot.docs);
      return items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }
    throw error;
  }
}

export async function updatePrescriptionStatus(id: string, status: PrescriptionStatus): Promise<void> {
  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    throw new Error('Invalid prescription status');
  }
  const admin = getFirebaseAdmin();
  await admin.firestore().collection(COLLECTION).doc(id).set({ status }, { merge: true });
}

export async function getPrescriptionById(id: string): Promise<Prescription | null> {
  const admin = getFirebaseAdmin();
  const doc = await admin.firestore().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { ...(doc.data() as Prescription), id: doc.id };
}
