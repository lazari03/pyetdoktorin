import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function parseServiceAccount(raw: string) {
  let normalized = raw;

  // Support dotenv-loaded JSON values that contain escaped quotes/newlines.
  if (normalized.includes('\\"')) {
    normalized = normalized
      .replace(/\n/g, '\\n')
      .replace(/\\"/g, '"');
  }

  const serviceAccount = JSON.parse(normalized) as Record<string, unknown>;
  const privateKey = serviceAccount.private_key;
  if (typeof privateKey === 'string' && !privateKey.includes('\n')) {
    serviceAccount.private_key = privateKey.replace(/\\n/g, '\n');
  }

  return serviceAccount;
}

function initAdmin() {
  if (!getApps().length) {
    // Try to use FIREBASE_SERVICE_ACCOUNT JSON first
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountJson) {
      try {
        const serviceAccount = parseServiceAccount(serviceAccountJson);
        initializeApp({
          credential: cert(serviceAccount),
        });
        return;
      } catch (error) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', error);
      }
    }
    
    // Fallback to individual environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    
    if (projectId && clientEmail && privateKey) {
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    } else {
      console.error('Firebase Admin SDK: Missing required environment variables');
      throw new Error('Firebase Admin SDK initialization failed: Missing credentials');
    }
  }
}
export function getAdmin() {
  initAdmin();
  return {
    auth: getAuth(),
    db: getFirestore(),
  };
}
