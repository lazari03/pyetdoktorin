import type { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';
import { UserRole } from '@/domain/entities/UserRole';
import { setSecurityHeaders } from '../../../src/config/httpHeaders';

const THIRTY_MIN = 30 * 60; // seconds
const ENV_PRODUCTION = 'production';

// ------------------------
// FIREBASE ADMIN INIT (robust)
// ------------------------
function getServiceAccountFromEnv(): admin.ServiceAccount | null {
  const envJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!envJson) return null;
  try {
    const sa: Partial<admin.ServiceAccount> & { private_key?: string } = JSON.parse(envJson);
    if (typeof sa.private_key === 'string') {
      sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    }
    return sa as admin.ServiceAccount;
  } catch (e) {
    console.warn('FIREBASE_SERVICE_ACCOUNT env is invalid JSON.', e);
    return null;
  }
}

function ensureAdmin(): boolean {
  if (admin.apps.length) return true;

  // Try service account from env first
  const sa = getServiceAccountFromEnv();
  if (sa) {
    try {
      admin.initializeApp({ credential: admin.credential.cert(sa) });
      return true;
    } catch (e) {
      console.error('Firebase Admin init with env service account failed:', e);
      // fallthrough to application default
    }
  }

  // Try application default credentials if provided (e.g., GOOGLE_APPLICATION_CREDENTIALS)
  try {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    return true;
  } catch (e) {
    console.error('Firebase Admin init with application default failed:', e);
    return false;
  }
}
// ------------------------

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!ensureAdmin()) {
      return res.status(500).json({ error: 'Server configuration error (admin init). Ensure FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS is set correctly.' });
    }
    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }

    // Verify the ID token using Firebase Admin
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      console.error("Token verification failed:", e);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const uid = decoded.uid;

    // Fetch user role from Firestore
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    let role = UserRole.Patient;

    if (userDoc.exists) {
      const data = userDoc.data();
      if (data && Object.values(UserRole).includes(data.role)) {
        role = data.role;
      }
    }

    const isProd = process.env.NODE_ENV === ENV_PRODUCTION;
    setSecurityHeaders(res, isProd);

    // Set auth cookies
    res.setHeader('Set-Cookie', [
      `session=1; Path=/; SameSite=Lax; Max-Age=${THIRTY_MIN}; HttpOnly${isProd ? '; Secure' : ''}`,
      `userRole=${encodeURIComponent(role)}; Path=/; SameSite=Lax; Max-Age=${THIRTY_MIN}${isProd ? '; Secure' : ''}`,
      `lastActivity=${Date.now()}; Path=/; SameSite=Lax; Max-Age=${THIRTY_MIN}${isProd ? '; Secure' : ''}`,
      `loggedIn=1; Path=/; SameSite=Lax; Max-Age=${THIRTY_MIN}${isProd ? '; Secure' : ''}`,
    ]);

    return res.status(200).json({ ok: true });
  } catch (e: unknown) {
    console.error('Session API error:', e);
    const message = e instanceof Error ? e.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}