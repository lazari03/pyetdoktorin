import admin from 'firebase-admin';
import { env } from './env';

let initialized = false;

export function getFirebaseAdmin() {
  if (!initialized) {
    let raw = env.firebaseServiceAccount;

    // dotenv v17 with quoted values:
    //   ‑ strips the outer "…"
    //   ‑ converts \\n → real newline
    //   ‑ but leaves \" as literal backslash-quote
    //
    // We need valid JSON for JSON.parse().  Strategy:
    //   1. Turn real newlines into the JSON escape \\n
    //   2. Turn literal \" into "  (unescape the quotes)
    // Order matters: step 1 must come first so the \" in step 2
    // doesn't collide with the \\n we just wrote.
    if (raw.includes('\\"')) {
      raw = raw
        .replace(/\n/g, '\\n')   // real newlines → JSON \\n
        .replace(/\\"/g, '"');   // literal \" → "
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
