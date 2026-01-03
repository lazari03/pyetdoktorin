import type { User } from '@/domain/entities/User';
import { UserRole } from '@/domain/entities/UserRole';
import { db } from '@/config/firebaseconfig';
import { FirestoreCollections } from '@/models/FirestoreConstants';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, orderBy, limit, startAfter, getCountFromServer, updateDoc, QueryDocumentSnapshot } from 'firebase/firestore';

export async function fetchUsers(): Promise<(User & { name?: string; surname?: string; approvalStatus?: 'pending' | 'approved' })[]> {
  const usersCol = collection(db, FirestoreCollections.Users);
  const snap = await getDocs(usersCol);
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    const base: User = {
      id: d.id,
      email: (data.email as string) || '',
      role: (data.role as UserRole) || UserRole.Patient,
    };
    const extended = {
      ...base,
      name: (data.name as string) || '',
      surname: (data.surname as string) || '',
      approvalStatus: (data.approvalStatus as 'pending' | 'approved' | undefined),
    } as User & { name?: string; surname?: string; approvalStatus?: 'pending' | 'approved' };
    return extended;
  });
}

export type UsersPage = {
  items: (User & { name?: string; surname?: string; approvalStatus?: 'pending' | 'approved' })[];
  total: number;
  nextCursor?: QueryDocumentSnapshot; // Firestore DocumentSnapshot for startAfter
};

// Cost-optimized paginated fetch: orders by name to have deterministic pages
export async function fetchUsersPage(pageSize: number, cursor?: QueryDocumentSnapshot): Promise<UsersPage> {
  const col = collection(db, FirestoreCollections.Users);
  const baseQuery = query(col, orderBy('name'), limit(pageSize));
  const q = cursor ? query(col, orderBy('name'), startAfter(cursor), limit(pageSize)) : baseQuery;
  const [snap, countSnap] = await Promise.all([
    getDocs(q),
    getCountFromServer(col),
  ]);
  const items = snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    const base: User = {
      id: d.id,
      email: (data.email as string) || '',
      role: (data.role as UserRole) || UserRole.Patient,
    };
    const extended = {
      ...base,
      name: (data.name as string) || '',
      surname: (data.surname as string) || '',
      approvalStatus: (data.approvalStatus as 'pending' | 'approved' | undefined),
    } as User & { name?: string; surname?: string; approvalStatus?: 'pending' | 'approved' };
    return extended;
  });
  const nextCursor = snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : undefined;
  return { items, total: countSnap.data().count, nextCursor };
}

export async function fetchUserById(id: string): Promise<(User & { approvalStatus?: 'pending' | 'approved' }) | null> {
  const ref = doc(db, FirestoreCollections.Users, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as Record<string, unknown>;
  return {
    id,
    email: (data.email as string) || '',
    role: (data.role as UserRole) || UserRole.Patient,
    approvalStatus: (data.approvalStatus as 'pending' | 'approved' | undefined),
  } as User & { approvalStatus?: 'pending' | 'approved' };
}

export async function fetchDoctorById(id: string): Promise<(User & { name?: string; surname?: string; specialization?: string; bio?: string }) | null> {
  const ref = doc(db, FirestoreCollections.Users, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as Record<string, unknown>;
  if (data.role !== UserRole.Doctor) return null;
  return {
    id,
    email: (data.email as string) || '',
    role: UserRole.Doctor,
    name: (data.name as string) || '',
    surname: (data.surname as string) || '',
    specialization: Array.isArray(data.specializations) ? (data.specializations as string[]).join(', ') : ((data.specialization as string) || ''),
    bio: (data.bio as string) || '',
  };
}

// Note: In client-side context, creating admins should go through a secure server action/API.
// This wrapper is a placeholder; implement securely on server.
export async function firebaseCreateAdmin(user: { name: string; surname: string; email: string; password: string }): Promise<User> {
  // Build a safe payload for Firestore without storing raw password on client-side
  const payload = {
    name: user.name,
    surname: user.surname,
    email: user.email,
  role: UserRole.Admin as const,
  };
  // Use email as id mapping only if you have a UID mapping service. Placeholder uses email as doc id.
  const id = user.email;
  const ref = doc(db, FirestoreCollections.Users, id);
  await setDoc(ref, payload, { merge: true });
  return { id, email: user.email, role: UserRole.Admin } as User;
}

export async function firebaseResetPassword(_userId: string): Promise<void> {
  // Implement via server-side Admin SDK; placeholder is no-op.
  return;
}

export async function firebaseDeleteUser(userId: string): Promise<void> {
  const ref = doc(db, FirestoreCollections.Users, userId);
  await deleteDoc(ref);
}

export async function upsertUser(user: Partial<User> & { id: string }): Promise<void> {
  const ref = doc(db, FirestoreCollections.Users, user.id);
  await setDoc(ref, user, { merge: true });
}

export async function updateDoctorProfile(
  id: string,
  fields: { specialization?: string; bio?: string; specializations?: string[] }
): Promise<void> {
  const ref = doc(db, FirestoreCollections.Users, id);
  // Build a safe payload without undefined values to satisfy Firestore updateDoc rules
  const safe: Record<string, unknown> = {};
  if (fields.specialization !== undefined) {
    safe.specialization = fields.specialization ?? "";
  }
  if (fields.bio !== undefined) {
    safe.bio = fields.bio ?? "";
  }
  if (fields.specializations !== undefined) {
    safe.specializations = Array.isArray(fields.specializations)
      ? fields.specializations
      : [];
  }
  if (Object.keys(safe).length === 0) return; // nothing to update
  await updateDoc(ref, safe);
}
