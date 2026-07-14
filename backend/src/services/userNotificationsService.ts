import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { UserNotificationForbiddenError, UserNotificationNotFoundError } from '@/errors/userNotificationErrors';

const COLLECTION = 'userNotifications';
const ARCHIVE_COLLECTION = 'userNotificationArchive';
const CLEANUP_BATCH_SIZE = 250;

// ponytail: rolling 30 days, not literal calendar-month semantics
export const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export interface UserNotificationInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface UserNotification extends UserNotificationInput {
  id: string;
  read: boolean;
  readAt: number | null;
  createdAt: number;
}

function mapDoc(doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot): UserNotification {
  const data = doc.data() as Omit<UserNotification, 'id'>;
  return { id: doc.id, ...data };
}

export async function createUserNotification(input: UserNotificationInput): Promise<UserNotification> {
  const db = getFirebaseAdmin().firestore();
  const doc = {
    ...input,
    read: false,
    readAt: null,
    createdAt: Date.now(),
  };
  const ref = await db.collection(COLLECTION).add(doc);
  return { id: ref.id, ...doc };
}

// ponytail: sorted in-memory rather than via `.orderBy('createdAt')` — a
// compound (userId ==, createdAt orderBy) query needs a Firestore composite
// index; per-user notification volume is small enough that fetching by
// userId alone and sorting here avoids that deploy dependency entirely.
export async function listUserNotifications(
  userId: string,
  opts?: { limit?: number },
): Promise<UserNotification[]> {
  const db = getFirebaseAdmin().firestore();
  const snap = await db.collection(COLLECTION).where('userId', '==', userId).get();
  return snap.docs
    .map(mapDoc)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, opts?.limit ?? 50);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const db = getFirebaseAdmin().firestore();
  const snap = await db
    .collection(COLLECTION)
    .where('userId', '==', userId)
    .where('read', '==', false)
    .count()
    .get();
  return snap.data().count;
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  const db = getFirebaseAdmin().firestore();
  const ref = db.collection(COLLECTION).doc(notificationId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new UserNotificationNotFoundError();
  }
  const data = snap.data() as UserNotification;
  if (data.userId !== userId) {
    throw new UserNotificationForbiddenError();
  }
  await ref.update({ read: true, readAt: Date.now() });
}

export async function markAllNotificationsRead(userId: string): Promise<{ updated: number }> {
  const db = getFirebaseAdmin().firestore();
  const snap = await db
    .collection(COLLECTION)
    .where('userId', '==', userId)
    .where('read', '==', false)
    .get();
  if (snap.empty) {
    return { updated: 0 };
  }
  const batch = db.batch();
  const now = Date.now();
  for (const doc of snap.docs) {
    batch.update(doc.ref, { read: true, readAt: now });
  }
  await batch.commit();
  return { updated: snap.size };
}

export async function archiveAndDeleteExpiredNotifications(cutoffMs: number): Promise<{ archived: number }> {
  const db = getFirebaseAdmin().firestore();
  let archived = 0;
  for (;;) {
    const snap = await db
      .collection(COLLECTION)
      .where('createdAt', '<', cutoffMs)
      .limit(CLEANUP_BATCH_SIZE)
      .get();
    if (snap.empty) break;

    const batch = db.batch();
    const archivedAt = Date.now();
    for (const doc of snap.docs) {
      batch.set(db.collection(ARCHIVE_COLLECTION).doc(doc.id), { ...doc.data(), archivedAt });
      batch.delete(doc.ref);
    }
    await batch.commit();
    archived += snap.size;

    if (snap.size < CLEANUP_BATCH_SIZE) break;
  }
  return { archived };
}

export async function getArchiveForUser(userId: string): Promise<UserNotification[]> {
  const db = getFirebaseAdmin().firestore();
  const snap = await db.collection(ARCHIVE_COLLECTION).where('userId', '==', userId).get();
  return snap.docs.map(mapDoc).sort((a, b) => b.createdAt - a.createdAt);
}
