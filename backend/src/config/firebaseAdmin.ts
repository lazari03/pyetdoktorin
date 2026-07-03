import admin from 'firebase-admin';
import { env } from './env';

let initialized = false;

export function getFirebaseAdmin() {
  if (!initialized) {
    let raw = env.firebaseServiceAccount.trim();

    // Accept base64-encoded JSON (safe for any dashboard / CI env var field)
    if (!raw.startsWith('{')) {
      raw = Buffer.from(raw, 'base64').toString('utf8');
    }

    // dotenv legacy: quoted value with escaped quotes
    if (raw.includes('\\"')) {
      raw = raw.replace(/\n/g, '\\n').replace(/\\"/g, '"');
    }

    const serviceAccount = JSON.parse(raw);

    // After parsing, the private_key field contains \\n literals
    // that need to be real newlines for the PEM to be valid.
    if (
      serviceAccount.private_key &&
      typeof serviceAccount.private_key === 'string' &&
      !serviceAccount.private_key.includes('\n')
    ) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
  }
  return admin;
}
