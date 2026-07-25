import { getFirebaseAdmin } from '@/config/firebaseAdmin';

const COLLECTION = 'notificationReadState';

// One doc per user (not one per notification) holding a `readIds` array,
// updated via `arrayUnion` — a flag-style field bump rather than a
// growing collection of per-notification records.
export async function listReadMarkIds(uid: string): Promise<string[]> {
  const db = getFirebaseAdmin().firestore();
  const doc = await db.collection(COLLECTION).doc(uid).get();
  return (doc.data()?.readIds as string[] | undefined) ?? [];
}

export async function markRead(uid: string, itemId: string): Promise<void> {
  const admin = getFirebaseAdmin();
  await admin
    .firestore()
    .collection(COLLECTION)
    .doc(uid)
    .set({ readIds: admin.firestore.FieldValue.arrayUnion(itemId) }, { merge: true });
}

export async function markManyRead(uid: string, itemIds: string[]): Promise<void> {
  if (itemIds.length === 0) return;
  const admin = getFirebaseAdmin();
  await admin
    .firestore()
    .collection(COLLECTION)
    .doc(uid)
    .set({ readIds: admin.firestore.FieldValue.arrayUnion(...itemIds) }, { merge: true });
}
