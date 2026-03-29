import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { UserRole } from '@/domain/entities/UserRole';
import { canListPrescriptionsForRole } from '@/domain/rules/userRoleRules';

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
  statusUpdatedAt?: number;
}

const COLLECTION = 'recipe';

function getPrescriptionQueryForRole(
  baseCollection: FirebaseFirestore.CollectionReference,
  uid: string,
  role: UserRole,
): FirebaseFirestore.Query {
  if (!canListPrescriptionsForRole(role)) {
    throw new Error(`Unsupported prescription role: ${role}`);
  }
  switch (role) {
    case UserRole.Admin:
      return baseCollection;
    case UserRole.Doctor:
      return baseCollection.where('doctorId', '==', uid);
    case UserRole.Patient:
      return baseCollection.where('patientId', '==', uid);
    case UserRole.Pharmacy:
      return baseCollection.where('pharmacyId', '==', uid);
    default:
      throw new Error(`Unsupported prescription role: ${role}`);
  }
}

export async function createPrescription(input: PrescriptionInput): Promise<Prescription> {
  const admin = getFirebaseAdmin();
  const createdAt = Date.now();
  const payload: Omit<Prescription, 'id'> = {
    doctorId: input.doctorId,
    doctorName: input.doctorName,
    patientId: input.patientId,
    patientName: input.patientName,
    medicines: input.medicines,
    status: 'pending' as PrescriptionStatus,
    createdAt,
    statusUpdatedAt: createdAt,
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
  const baseCollection = admin.firestore().collection(COLLECTION);
  const query = getPrescriptionQueryForRole(baseCollection, uid, role).orderBy('createdAt', 'desc');
  const mapDocs = (docs: FirebaseFirestore.QueryDocumentSnapshot[]) =>
    docs.map((doc) => ({ ...(doc.data() as Prescription), id: doc.id }));

  try {
    const snapshot = await query.limit(200).get();
    return mapDocs(snapshot.docs);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    // Fallback for missing composite index in dev/preview environments.
    if (message.toLowerCase().includes('index')) {
      const fallbackQuery = getPrescriptionQueryForRole(baseCollection, uid, role);
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
  await admin.firestore().collection(COLLECTION).doc(id).set({
    status,
    statusUpdatedAt: Date.now(),
  }, { merge: true });
}

export async function getPrescriptionById(id: string): Promise<Prescription | null> {
  const admin = getFirebaseAdmin();
  const doc = await admin.firestore().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { ...(doc.data() as Prescription), id: doc.id };
}
