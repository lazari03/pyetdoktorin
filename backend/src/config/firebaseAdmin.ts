import admin from 'firebase-admin';
import { env } from './env';

let initialized = false;

export function getFirebaseAdmin() {
  if (!initialized) {
    const serviceAccount = JSON.parse(env.firebaseServiceAccount);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
  }
  return admin;
}
