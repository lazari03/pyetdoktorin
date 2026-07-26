import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { UserRole } from '@/domain/entities/UserRole';

const COLLECTION = 'supportTickets';

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  topic: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  adminNotes?: string;
  createdAt: number;
  updatedAt: number;
}

function mapDoc(doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot): SupportTicket {
  const data = doc.data() as Omit<SupportTicket, 'id'>;
  return { id: doc.id, ...data };
}

export async function createSupportTicket(input: {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  topic: string;
  subject: string;
  message: string;
}): Promise<SupportTicket> {
  const db = getFirebaseAdmin().firestore();
  const now = Date.now();
  const doc = {
    ...input,
    status: 'open' as const,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await db.collection(COLLECTION).add(doc);
  return { id: ref.id, ...doc };
}

// ponytail: sorted/filtered in-memory rather than compound Firestore queries —
// ticket volume is small enough that this avoids needing composite indexes.
export async function listTicketsForUser(userId: string): Promise<SupportTicket[]> {
  const db = getFirebaseAdmin().firestore();
  const snap = await db.collection(COLLECTION).where('userId', '==', userId).get();
  return snap.docs.map(mapDoc).sort((a, b) => b.createdAt - a.createdAt);
}

export async function listAllTickets(): Promise<SupportTicket[]> {
  const db = getFirebaseAdmin().firestore();
  const snap = await db.collection(COLLECTION).get();
  return snap.docs.map(mapDoc).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getTicketById(id: string): Promise<SupportTicket | null> {
  const db = getFirebaseAdmin().firestore();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return mapDoc(doc);
}

export async function updateTicketStatus(
  id: string,
  updates: { status?: SupportTicketStatus; adminNotes?: string },
): Promise<SupportTicket | null> {
  const db = getFirebaseAdmin().firestore();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;
  await ref.update({ ...updates, updatedAt: Date.now() });
  const updated = await ref.get();
  return mapDoc(updated);
}
