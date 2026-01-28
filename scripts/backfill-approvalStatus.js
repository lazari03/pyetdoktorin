const admin = require('firebase-admin');

function loadServiceAccount() {
  const svcEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (svcEnv) {
    try {
      const sa = JSON.parse(svcEnv);
      if (sa.private_key && typeof sa.private_key === 'string') {
        sa.private_key = sa.private_key.replace(/\\n/g, '\n');
      }
      return sa;
    } catch (e) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT env; falling back to local JSON file.', e);
    }
  }
  // Fallback to local JSON file in repo
  try {
    // Adjust path if the file name changes
    const sa = require('../pyetdoktorin-b76b9-firebase-adminsdk-fbsvc-801b17ac0b.json');
    if (sa.private_key && typeof sa.private_key === 'string') {
      sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    }
    return sa;
  } catch (e) {
    console.error('Failed to load local service account JSON. Set FIREBASE_SERVICE_ACCOUNT env or ensure the file exists.', e);
    process.exit(1);
  }
}

try {
  const serviceAccount = loadServiceAccount();
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (e) {
  console.error('Failed to initialize Firebase Admin SDK:', e);
  process.exit(1);
}

async function run() {
  const db = admin.firestore();
  const usersCol = db.collection('users');

  console.log('Fetching users with role="doctor"...');
  const snapshot = await usersCol.where('role', '==', 'doctor').get();
  if (snapshot.empty) {
    console.log('No doctor users found.');
    return;
  }

  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!('approvalStatus' in data) || typeof data.approvalStatus === 'undefined') {
      await doc.ref.set({ approvalStatus: 'approved' }, { merge: true });
      updated++;
      console.log(`Set approved for user: ${doc.id}`);
    }
  }

  console.log(`Done. Updated ${updated} users.`);
}

run()
  .then(() => {
    console.log('Migration completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
