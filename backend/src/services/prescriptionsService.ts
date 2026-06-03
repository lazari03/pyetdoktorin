import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { UserRole } from '@/domain/entities/UserRole';
import { canListPrescriptionsForRole } from '@/domain/rules/userRoleRules';
import { getUserProfile } from '@/services/userProfileService';

export type PrescriptionStatus = 'pending' | 'accepted' | 'rejected';
export type PrescriptionType = 'standard' | 'reimbursement';

export interface PrescriptionInput {
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  type?: PrescriptionType;
  reimbursementCode?: string;
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
    type: input.type ?? 'standard',
    medicines: input.medicines,
    status: 'pending' as PrescriptionStatus,
    createdAt,
    statusUpdatedAt: createdAt,
    ...(input.reimbursementCode !== undefined ? { reimbursementCode: input.reimbursementCode } : {}),
    ...(input.pharmacyId !== undefined ? { pharmacyId: input.pharmacyId } : {}),
    ...(input.pharmacyName !== undefined ? { pharmacyName: input.pharmacyName } : {}),
    ...(input.dosage !== undefined ? { dosage: input.dosage } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.signatureDataUrl !== undefined ? { signatureDataUrl: input.signatureDataUrl } : {}),
  };
  const ref = await admin.firestore().collection(COLLECTION).add(payload);
  if (payload.type === 'reimbursement' && payload.reimbursementCode) {
    await admin.firestore().collection('users').doc(input.patientId).set({
      reimbursementCode: payload.reimbursementCode,
      reimbursementCodeUpdatedAt: createdAt,
    }, { merge: true });
  }
  return { id: ref.id, ...payload };
}

async function runQuery(
  query: FirebaseFirestore.Query,
  fallbackQuery: FirebaseFirestore.Query,
  mapDocs: (docs: FirebaseFirestore.QueryDocumentSnapshot[]) => Prescription[],
): Promise<Prescription[]> {
  try {
    const snapshot = await query.limit(200).get();
    return mapDocs(snapshot.docs);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.toLowerCase().includes('index')) {
      const snapshot = await fallbackQuery.limit(200).get();
      const items = mapDocs(snapshot.docs);
      return items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }
    throw error;
  }
}

export async function listPrescriptionsForRole(uid: string, role: UserRole): Promise<Prescription[]> {
  const admin = getFirebaseAdmin();
  const baseCollection = admin.firestore().collection(COLLECTION);
  const mapDocs = (docs: FirebaseFirestore.QueryDocumentSnapshot[]) =>
    docs.map((doc) => ({ ...(doc.data() as Prescription), id: doc.id }));

  if (role === UserRole.Pharmacy) {
    const profile = await getUserProfile(uid);
    const pharmacyName = profile?.pharmacyName ?? null;

    const byIdItems = await runQuery(
      baseCollection.where('pharmacyId', '==', uid).orderBy('createdAt', 'desc'),
      baseCollection.where('pharmacyId', '==', uid),
      mapDocs,
    );

    const byNameItems = pharmacyName
      ? await runQuery(
          baseCollection.where('pharmacyName', '==', pharmacyName).orderBy('createdAt', 'desc'),
          baseCollection.where('pharmacyName', '==', pharmacyName),
          mapDocs,
        )
      : [];

    const seenIds = new Set(byIdItems.map((p) => p.id));
    const merged = [...byIdItems, ...byNameItems.filter((p) => !seenIds.has(p.id))];
    return merged.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  const baseQuery = getPrescriptionQueryForRole(baseCollection, uid, role);
  return runQuery(
    baseQuery.orderBy('createdAt', 'desc'),
    baseQuery,
    mapDocs,
  );
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
