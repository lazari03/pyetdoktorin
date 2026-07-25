import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { DOCTOR_TERMS_VERSION } from '@/content/doctorTermsContent';

const COLLECTION = 'doctorAgreements';

export interface DoctorAgreement {
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  termsVersion: string;
  signatureDataUrl: string;
  signedAt: number;
}

export type DoctorAgreementSummary = Omit<DoctorAgreement, 'signatureDataUrl'>;

// One current agreement per doctor (doc id = doctorId) — re-signing overwrites
// the previous record with the latest terms version and signature.
export async function submitAgreement(input: {
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  signatureDataUrl: string;
}): Promise<DoctorAgreement> {
  const db = getFirebaseAdmin().firestore();
  const agreement: DoctorAgreement = {
    doctorId: input.doctorId,
    doctorName: input.doctorName,
    doctorEmail: input.doctorEmail,
    termsVersion: DOCTOR_TERMS_VERSION,
    signatureDataUrl: input.signatureDataUrl,
    signedAt: Date.now(),
  };
  await db.collection(COLLECTION).doc(input.doctorId).set(agreement);
  return agreement;
}

export async function getAgreement(doctorId: string): Promise<DoctorAgreement | null> {
  const db = getFirebaseAdmin().firestore();
  const doc = await db.collection(COLLECTION).doc(doctorId).get();
  if (!doc.exists) return null;
  return doc.data() as DoctorAgreement;
}

export async function listAgreementSummaries(): Promise<DoctorAgreementSummary[]> {
  const db = getFirebaseAdmin().firestore();
  const snap = await db.collection(COLLECTION).get();
  return snap.docs
    .map((doc) => {
      const { signatureDataUrl: _signatureDataUrl, ...summary } = doc.data() as DoctorAgreement;
      return summary;
    })
    .sort((a, b) => b.signedAt - a.signedAt);
}
