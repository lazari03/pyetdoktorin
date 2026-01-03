import type { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';
import { FirestoreCollections } from '@/config/FirestoreCollections';

// ------------------------
// FIREBASE ADMIN INIT
// ------------------------
// Initialize Admin SDK once using FIREBASE_SERVICE_ACCOUNT environment variable
if (!admin.apps.length) {
  let serviceAccount;
  try {
    const svcEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!svcEnv) throw new Error('FIREBASE_SERVICE_ACCOUNT env is not set');
    const svc: admin.ServiceAccount = JSON.parse(svcEnv);
    admin.initializeApp({
      credential: admin.credential.cert(svc),
    });
    const envVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!envVar) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
    }
    serviceAccount = JSON.parse(envVar);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'FIREBASE_SERVICE_ACCOUNT env is not valid JSON.';
    console.error(message);
    throw new Error(message);
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
// ------------------------

type UserFields = {
  name?: string;
  surname?: string;
  role?: string;
  email?: string;
  approvalStatus?: 'pending' | 'approved';
};

type DoctorFields = {
  specialization?: string;
  bio?: string;
  specializations?: string[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    // Verify admin using Firebase ID token from Authorization header (Bearer) or cookie
    const isAdmin = await verifyAdminFromRequest(req);
    if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });

  const { id, userFields, doctorFields, approveDoctor } = req.body as { id?: string; userFields?: UserFields; doctorFields?: DoctorFields; approveDoctor?: boolean };
    if (!id) return res.status(400).json({ error: 'Missing user id' });

    const db = admin.firestore();

    // Handle user fields
    if (userFields && hasKeys(userFields)) {
      const safeUser = sanitizeUserFields(userFields);
      await db.collection(FirestoreCollections.Users).doc(id).set(safeUser, { merge: true });

      // If role changed to non-doctor, clear doctor subprofile
      if (userFields.role && userFields.role !== 'doctor') {
        await db
          .collection(FirestoreCollections.Users)
          .doc(id)
          .collection(FirestoreCollections.Doctors)
          .doc(id)
          .set({ specialization: '', bio: '', specializations: [] }, { merge: true });
      }
    }

    // Explicit approval action (admin only): mark doctor as approved
    if (approveDoctor === true) {
      await db.collection(FirestoreCollections.Users).doc(id).set({ approvalStatus: 'approved' }, { merge: true });
    }

    // Handle doctor fields
    if (doctorFields && hasKeys(doctorFields)) {
      const safeDoc = sanitizeDoctorFields(doctorFields);
      await db
        .collection(FirestoreCollections.Users)
        .doc(id)
        .collection(FirestoreCollections.Doctors)
        .doc(id)
        .set(safeDoc, { merge: true });
    }

    return res.status(200).json({ ok: true });
  } catch (e: unknown) {
    console.error('Admin update-user error:', e);
    const message = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : 'Internal Server Error';
    return res.status(500).json({ error: message });
  }
}

function hasKeys(obj: Record<string, unknown> | undefined): boolean {
  return !!obj && Object.keys(obj).length > 0;
}

function sanitizeUserFields(fields: UserFields): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (fields.name !== undefined) out.name = (fields.name ?? '').trim();
  if (fields.surname !== undefined) out.surname = (fields.surname ?? '').trim();
  if (fields.email !== undefined) out.email = (fields.email ?? '').trim();
  if (fields.role !== undefined) out.role = (fields.role ?? 'user').trim();
  if (fields.approvalStatus !== undefined) out.approvalStatus = fields.approvalStatus;
  return out;
}

function sanitizeDoctorFields(fields: DoctorFields): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (fields.specialization !== undefined) out.specialization = (fields.specialization ?? '').trim();
  if (fields.bio !== undefined) out.bio = (fields.bio ?? '').trim();
  if (fields.specializations !== undefined) out.specializations = Array.isArray(fields.specializations)
    ? fields.specializations.filter(Boolean)
    : [];
  return out;
}

async function verifyAdminFromRequest(req: NextApiRequest): Promise<boolean> {
  try {
    // Prefer Authorization header: "Bearer <ID_TOKEN>"
    const auth = req.headers.authorization;
    let idToken: string | null = null;
    if (auth && auth.startsWith('Bearer ')) {
      idToken = auth.substring('Bearer '.length);
    }

    // Optional: look for a cookie named "__session" or "token" if using cookie-based tokens
    if (!idToken && req.cookies) {
      idToken = req.cookies.__session || req.cookies.token || null;
    }

    if (!idToken) return false;

  const decoded = await admin.auth().verifyIdToken(idToken);
    // Accept either a custom claim admin: true or role === 'admin'
    const claimAdmin = (
      ('admin' in decoded && (decoded as { admin?: boolean }).admin === true) ||
      ('role' in decoded && (decoded as { role?: string }).role === 'admin')
    );
    if (claimAdmin) return true;

    // Fallback: check Firestore user doc role
    const uid = decoded.uid;
    const db = admin.firestore();
    const snap = await db.collection(FirestoreCollections.Users).doc(uid).get();
    const role = snap.exists ? (snap.data()?.role as string | undefined) : undefined;
    return role === 'admin';
  } catch (e: unknown) {
    console.warn('verifyAdminFromRequest failed:', e);
    return false;
  }
}
